import { MigrationInterface, QueryRunner } from "typeorm";

export class initial1672060365266 implements MigrationInterface {
    name = 'initial1672060365266'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "FK_94f168faad896c0786646fa3d4a"`);
        await queryRunner.query(`CREATE TABLE "appointment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "refId" character varying NOT NULL, "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "created" TIMESTAMP NOT NULL DEFAULT '"2022-12-26T13:12:47.115Z"', "modified" TIMESTAMP NOT NULL DEFAULT '"2022-12-26T13:12:47.115Z"', "serviceId" uuid, "userId" uuid, "doctorId" uuid, CONSTRAINT "UQ_fe227ce6cefe3922f5eac53db5c" UNIQUE ("refId"), CONSTRAINT "PK_e8be1a53027415e709ce8a2db74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "availability" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "userId" uuid, CONSTRAINT "PK_05a8158cf1112294b1c86e7f1d3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "created" SET DEFAULT '"2022-12-26T13:12:47.116Z"'`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "modified" SET DEFAULT '"2022-12-26T13:12:47.116Z"'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "created" SET DEFAULT '"2022-12-26T13:12:47.117Z"'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "modified" SET DEFAULT '"2022-12-26T13:12:47.117Z"'`);
        await queryRunner.query(`ALTER TABLE "token" ALTER COLUMN "created" SET DEFAULT '"2022-12-26T13:12:47.120Z"'`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_cee8b55c31f700609674da96b0b" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_2a990a304a43ccc7415bf7e3a99" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_514bcc3fb1b8140f85bf1cde6e2" FOREIGN KEY ("doctorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "availability" ADD CONSTRAINT "FK_42a42b693f05f17e56d1d9ba93f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "token" ADD CONSTRAINT "FK_94f168faad896c0786646fa3d4a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "FK_94f168faad896c0786646fa3d4a"`);
        await queryRunner.query(`ALTER TABLE "availability" DROP CONSTRAINT "FK_42a42b693f05f17e56d1d9ba93f"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_514bcc3fb1b8140f85bf1cde6e2"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_2a990a304a43ccc7415bf7e3a99"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_cee8b55c31f700609674da96b0b"`);
        await queryRunner.query(`ALTER TABLE "token" ALTER COLUMN "created" SET DEFAULT '2022-12-26 10:04:33.135'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "modified" SET DEFAULT '2022-12-26 10:04:33.133'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "created" SET DEFAULT '2022-12-26 10:04:33.133'`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "modified" SET DEFAULT '2022-12-26 10:04:33.131'`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "created" SET DEFAULT '2022-12-26 10:04:33.131'`);
        await queryRunner.query(`DROP TABLE "availability"`);
        await queryRunner.query(`DROP TABLE "appointment"`);
        await queryRunner.query(`ALTER TABLE "token" ADD CONSTRAINT "FK_94f168faad896c0786646fa3d4a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
