import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment, Services, Status, User } from '../../../entities';
import {
  DataSource,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
  And,
  ILike,
} from 'typeorm';

import { SearchAppointmentDto, UpdateAppointmentDto } from '../dto';

import { MailService } from '../../../mail/mail.service';
import { ResponseDto } from '../../base/dto';
import { CreateAppointmentDto } from '../../../modules/other/dto';
import { addHours, format, startOfMonth } from 'date-fns';

@Injectable()
export class AppointmentService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Services)
    private readonly serviceRepository: Repository<Services>,
  ) {}

  public async getAppointments(
    data: SearchAppointmentDto,
  ): Promise<ResponseDto> {
    const greaterDate = data.startDate,
      lessDate = data.endDate;

    const searchData = {
      status: data.status,
      time: data.time,
      verification: IsNull(),
      date:
        !!greaterDate && !!lessDate
          ? And(
              LessThanOrEqual(new Date(lessDate)),
              MoreThanOrEqual(new Date(greaterDate)),
            )
          : undefined,
    };

    const appointment = await this.appointmentRepository.find({
      where: [
        {
          name: !!data.search ? ILike(data.search + '%') : undefined,
          ...searchData,
        },
        {
          email: !!data.search ? ILike(data.search + '%') : undefined,
          ...searchData,
        },
        {
          refId: !!data.search ? ILike(data.search + '%') : undefined,
          ...searchData,
        },
      ],
      order: {
        created: 'DESC',
      },
      skip: (data.page ?? 0) * (data.limit ?? 20),
      take: data.limit ?? 20,
      relations: ['service'],
    });

    const total = await this.appointmentRepository.count({
      where: [
        {
          name: !!data.search ? ILike(data.search + '%') : undefined,
          ...searchData,
        },
        {
          email: !!data.search ? ILike(data.search + '%') : undefined,
          ...searchData,
        },
        {
          refId: !!data.search ? ILike(data.search + '%') : undefined,
          ...searchData,
        },
      ],
      order: {
        created: 'DESC',
      },
      skip: (data.page ?? 0) * (data.limit ?? 20),
      take: data.limit ?? 20,
      relations: ['service'],
    });

    return {
      data: appointment,
      total,
    };
  }

  public async getAppointmentInfo(id: string) {
    const appointment = await this.appointmentRepository.findOne({
      where: {
        id,
      },
      relations: ['service'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  public async deleteAppointment(id: string[] | string) {
    const appointment = await this.appointmentRepository.find({
      where:
        typeof id === 'string'
          ? { id }
          : (id as string[])?.map((d) => ({ id: d })),
    });
    return await this.appointmentRepository.remove(appointment);
  }

  private async getNotAvailabilityStatus(
    startAt: string,
    endAt: string,
    status: string,
    timeZone: string,
  ): Promise<
    {
      date: string;
    }[]
  > {
    return await this.appointmentRepository
      .createQueryBuilder('appointment')
      .select(
        "TO_CHAR(timezone(:timeZone, appointment.startDate), 'yyyy-mm-dd hh24') as date",
      )
      .distinct(true)
      .where(
        `appointment.startDate >= timezone(current_setting('TIMEZONE'), :startAt) AND appointment.endDate <= timezone(current_setting('TIMEZONE'), :endAt) 
          AND status = :status AND (appointment.startDate IS NOT NULL OR appointment.endDate IS NOT NULL) AND appointment.verification IS NULL`,
      )
      .groupBy('appointment.startDate')
      .setParameters({
        status,
        timeZone,
        startAt,
        endAt,
      })
      .getRawMany();
  }

  private beginingOfDay(options: { date: Date; timeZone: string }) {
    const { date = new Date(), timeZone } = options;
    const parts = Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    }).formatToParts(date);
    const hour = parseInt(parts.find((i) => i.type === 'hour').value);
    const minute = parseInt(parts.find((i) => i.type === 'minute').value);
    const second = parseInt(parts.find((i) => i.type === 'second').value);
    return new Date(
      1000 *
        Math.floor(
          (date.getTime() - hour * 3600000 - minute * 60000 - second * 1000) /
            1000,
        ),
    );
  }

  public async updateAppointment(id: string, data: UpdateAppointmentDto) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
    });

    if (!appointment) throw new NotFoundException('Appointment not found');

    let service: Services | undefined;

    if (!!data.serviceId) {
      service = await this.serviceRepository.findOne({
        where: {
          id: data.serviceId,
        },
      });
      if (!service) throw new NotFoundException();
    }

    if (!!data.date) {
      const startDate = new Date(data.date);
      const endDate = addHours(startDate, 1);

      const start = this.beginingOfDay({
        date: startOfMonth(startDate),
        timeZone: data.timeZone,
      });
      const end = addHours(start, 1);

      const dates = await this.getNotAvailabilityStatus(
        format(start, 'yyyy-MM-dd HH:mm:ss'),
        format(end, 'yyyy-MM-dd HH:mm:ss'),
        Status.accepted,
        data.timeZone,
      );
      if (dates.length === 0) {
        appointment.date = startDate;
        appointment.startDate = startDate;
        appointment.endDate = endDate;
      } else {
        throw new BadRequestException('Date and time not available');
      }
    }

    appointment.service = service ?? appointment.service;
    appointment.time = data.time;
    appointment.status = data.status;

    const updated = await this.appointmentRepository.save(appointment);

    try {
      const start = new Date(updated?.startDate ?? 0);
      start.setHours(start.getHours() + 8);
      const end = new Date(updated?.endDate ?? 0);
      end.setHours(end.getHours() + 8);
      await this.mailService.sendMail(
        updated.email,
        'Your appointment status has been updated',
        'appointment',
        {
          refId: updated.refId,
          name: updated.name,
          status: updated.status,
          time:
            !!updated.startDate && !!updated.endDate
              ? 'Time: ' +
                format(start, 'EEEE, LLLL do yyyy  hh:mm a') +
                ' to ' +
                format(end, 'EEEE, LLLL do yyyy  hh:mm a')
              : '',
          service: updated.service.name,
        },
      );
    } finally {
      return updated;
    }
  }

  private getAge(dateString: string) {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  public async newAppointment(data: CreateAppointmentDto) {
    const appointment = new Appointment();
    const service = await this.serviceRepository.findOne({
      where: { id: data.serviceId },
    });

    if (!service) throw new NotFoundException('Service not found');

    const startDate = new Date(data.date);
    const endDate = addHours(startDate, 1);

    const start = this.beginingOfDay({
      date: startOfMonth(startDate),
      timeZone: data.timeZone,
    });
    const end = addHours(start, 1);

    const dates = await this.getNotAvailabilityStatus(
      format(start, 'yyyy-MM-dd HH:mm:ss'),
      format(end, 'yyyy-MM-dd HH:mm:ss'),
      Status.accepted,
      data.timeZone,
    );
    if (dates.length === 0) {
      appointment.date = startDate;
      appointment.startDate = startDate;
      appointment.endDate = endDate;
    } else {
      throw new BadRequestException('Date and time not available');
    }

    appointment.status = Status.pending;
    appointment.service = service;
    appointment.email = data.email;
    appointment.name = data.name;
    appointment.time = data.time;
    appointment.age = this.getAge(data.birthDate);
    appointment.birthDate = data.birthDate;
    appointment.petName = data.petName;
    appointment.gender = data.gender;
    appointment.refId = (
      new Date().getTime().toString(36) + Math.random().toString(36).slice(8)
    ).toUpperCase();
    appointment.message = data.message ?? '';
    try {
      await this.mailService.sendMail(
        appointment.email,
        'Your booking is now verified',
        'verified',
        {
          name: appointment.name,
          code: appointment.refId,
        },
      );
    } finally {
      return await this.appointmentRepository.save(appointment);
    }
  }
}
