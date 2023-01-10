import { MigrationInterface, QueryRunner } from "typeorm";

export class initial1673191023140 implements MigrationInterface {
    name = 'initial1673191023140'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "replies" ADD "modified" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "date" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "replies" ALTER COLUMN "created" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "contact_us" ALTER COLUMN "created" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "created" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "modified" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "created" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "modified" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "appointment" ALTER COLUMN "refId" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "appointment" ALTER COLUMN "verification" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "appointment" ALTER COLUMN "created" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "appointment" ALTER COLUMN "modified" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "token" ALTER COLUMN "created" SET DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "token" ALTER COLUMN "created" SET DEFAULT '2023-01-01 10:29:06.283'`);
        await queryRunner.query(`ALTER TABLE "appointment" ALTER COLUMN "modified" SET DEFAULT '2023-01-01 10:29:06.275'`);
        await queryRunner.query(`ALTER TABLE "appointment" ALTER COLUMN "created" SET DEFAULT '2023-01-01 10:29:06.275'`);
        await queryRunner.query(`ALTER TABLE "appointment" ALTER COLUMN "verification" SET DEFAULT 'lcd8d6jn'`);
        await queryRunner.query(`ALTER TABLE "appointment" ALTER COLUMN "refId" SET DEFAULT 'LCD8D6JNZLZ7LSTRYAA'`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "modified" SET DEFAULT '2023-01-01 10:29:06.274'`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "created" SET DEFAULT '2023-01-01 10:29:06.274'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "modified" SET DEFAULT '2023-01-01 10:29:06.274'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "created" SET DEFAULT '2023-01-01 10:29:06.274'`);
        await queryRunner.query(`ALTER TABLE "contact_us" ALTER COLUMN "created" SET DEFAULT '2023-01-01 10:29:06.28'`);
        await queryRunner.query(`ALTER TABLE "replies" ALTER COLUMN "created" SET DEFAULT '2023-01-01 10:29:06.28'`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "date"`);
        await queryRunner.query(`ALTER TABLE "replies" DROP COLUMN "modified"`);
    }

}
