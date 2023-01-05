import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Appointment,
  Availability,
  ContactUs,
  Replies,
  Role,
  Services,
  User,
} from '../../../entities';
import {
  Brackets,
  DataSource,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';

import { SearchAppointmentDto, UpdateAppointmentDto } from '../dto';
import { ifMatched, hashPassword } from '../../../helpers/hash.helper';
import { TokenService } from '../../../authentication/services/token.service';
import { MailService } from 'src/mail/mail.service';
import { DeleteDto, ResponseDto, SearchUserDto } from 'src/modules/base/dto';
import { Roles } from 'src/enum';

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
    const appointment = await this.appointmentRepository.find({
      where: {
        status: data.status,
        time: data.time,
        verification: IsNull(),
      },
      order: {
        created: 'DESC',
      },
      skip: (data.page ?? 0) * (data.limit ?? 20),
      take: data.limit ?? 20,
      relations: ['service'],
    });

    const total = await this.appointmentRepository.count({
      where: {
        status: data.status,
        time: data.time,
        verification: IsNull(),
      },
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
      relations: [
        'service',
        'doctor',
        'doctor.services',
        'doctor.availability',
      ],
    });

    if (!appointment) throw new NotFoundException('Appointment not found');
    appointment.doctor.hasAm = !!appointment.doctor.availability.some(
      (d) => d.startDate.getHours() < 12 || d.endDate.getHours() < 12,
    );

    appointment.doctor.hasPm = !!appointment.doctor.availability.some(
      (d) => d.startDate.getHours() >= 12 || d.endDate.getHours() >= 12,
    );
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

    return await this.appointmentRepository.save(appointment);
  }
}
