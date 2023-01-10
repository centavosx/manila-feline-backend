import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment, Services, Status, User } from '../../../entities';
import {
  DataSource,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
  And,
} from 'typeorm';

import { SearchAppointmentDto, UpdateAppointmentDto } from '../dto';

import { MailService } from 'src/mail/mail.service';
import { ResponseDto } from 'src/modules/base/dto';
import { Roles } from 'src/enum';
import { CreateAppointmentDto } from 'src/modules/other/dto';
import { format } from 'date-fns';

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

    const appointment = await this.appointmentRepository.find({
      where: {
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
      },
      order: {
        created: 'DESC',
      },
      skip: (data.page ?? 0) * (data.limit ?? 20),
      take: data.limit ?? 20,
      relations: ['service', 'doctor'],
    });

    const total = await this.appointmentRepository.count({
      where: {
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
      },
      order: {
        created: 'DESC',
      },
      skip: (data.page ?? 0) * (data.limit ?? 20),
      take: data.limit ?? 20,
      relations: ['service', 'doctor'],
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
      relations: ['service', 'doctor'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    appointment.doctor = !!appointment.doctor
      ? await this.userRepository.findOne({
          where: { id: appointment.doctor?.id },
          relations: ['services', 'availability'],
        })
      : null;
    if (!!appointment.doctor) {
      appointment.doctor.hasAm = !!appointment.doctor.availability.some(
        (d) => d.startDate.getHours() < 12 || d.endDate.getHours() < 12,
      );

      appointment.doctor.hasPm = !!appointment.doctor.availability.some(
        (d) => d.startDate.getHours() >= 12 || d.endDate.getHours() >= 12,
      );
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

  public async updateAppointment(id: string, data: UpdateAppointmentDto) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['doctor'],
    });

    if (!appointment) throw new NotFoundException('Appointment not found');

    let service: Services | undefined, doctor: User | undefined;
    if (!!data.doctorId) {
      doctor = await this.userRepository.findOne({
        where: {
          id: data.doctorId,
          roles: {
            name: Roles.DOCTOR,
          },
        },
        relations: ['roles', 'services', 'availability'],
      });

      if (!doctor) throw new NotFoundException('Doctor not found');
    }

    if (!doctor && !!data.serviceId) {
      throw new NotFoundException('Service not found');
    }

    if (!!data.serviceId) {
      service = await this.serviceRepository.findOne({
        where: {
          id: data.serviceId,
        },
      });
    }

    appointment.service = service ?? appointment.service;
    appointment.doctor = doctor ?? appointment.doctor;
    appointment.startDate = !!data.startDate
      ? new Date(data.startDate)
      : appointment.startDate;
    appointment.endDate = !!data.endDate
      ? new Date(data.endDate)
      : appointment.endDate;
    appointment.time = data.time;
    appointment.status = data.status;

    const updated = await this.appointmentRepository.save(appointment);

    await this.mailService.sendMail(
      updated.email,
      'Your appointment status has been updated',
      'appointment',
      {
        refId: updated.id,
        name: updated.name,
        status: updated.status,
        time:
          !!updated.startDate && !!updated.endDate
            ? 'Time: ' +
              format(
                new Date(updated?.startDate ?? 0),
                'EEEE, LLLL do yyyy  hh:mm a',
              ) +
              ' to ' +
              format(
                new Date(updated?.endDate ?? 0),
                'EEEE, LLLL do yyyy  hh:mm a',
              )
            : '',
        doctor: !!appointment.doctor
          ? 'Doctor: Dr ' + appointment.doctor.name
          : '',
        service: updated.service.name,
      },
    );

    return updated;
  }

  public async newAppointment(data: CreateAppointmentDto) {
    const appointment = new Appointment();
    const service = await this.serviceRepository.findOne({
      where: { id: data.serviceId },
    });

    if (!service) throw new NotFoundException('Service not found');

    appointment.date = data.date;
    appointment.status = Status.pending;
    appointment.service = service;
    appointment.email = data.email;
    appointment.name = data.name;
    appointment.time = data.time;
    appointment.refId = (
      new Date().getTime().toString(36) + Math.random().toString(36).slice(8)
    ).toUpperCase();
    appointment.message = data.message ?? '';

    await this.mailService.sendMail(
      appointment.email,
      'Your booking is now verified',
      'verified',
      {
        name: appointment.name,
        code: appointment.refId,
      },
    );

    return await this.appointmentRepository.save(appointment);
  }
}
