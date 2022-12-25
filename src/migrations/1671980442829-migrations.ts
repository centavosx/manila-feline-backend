import { MigrationInterface, QueryRunner } from "typeorm";

export class migrations1671980442829 implements MigrationInterface {
    name = 'migrations1671980442829'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd"`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "PK_fb2e442d14add3cefbdf33c4561"`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "PK_7b4e17a669299579dfa55a3fc35" PRIMARY KEY ("userId", "roleId")`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "created" SET DEFAULT '"2022-12-25T15:00:44.724Z"'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "modified" SET DEFAULT '"2022-12-25T15:00:44.724Z"'`);
        await queryRunner.query(`ALTER TABLE "appointment" ALTER COLUMN "created" SET DEFAULT '"2022-12-25T15:00:44.724Z"'`);
        await queryRunner.query(`ALTER TABLE "appointment" ALTER COLUMN "modified" SET DEFAULT '"2022-12-25T15:00:44.724Z"'`);
        await queryRunner.query(`ALTER TABLE "token" ALTER COLUMN "created" SET DEFAULT '"2022-12-25T15:00:44.728Z"'`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "REL_ab40a6f0cd7d3ebfcce082131f"`);
        await queryRunner.query(`CREATE INDEX "IDX_ab40a6f0cd7d3ebfcce082131f" ON "user_role" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_dba55ed826ef26b5b22bd39409" ON "user_role" ("roleId") `);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dba55ed826ef26b5b22bd39409"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ab40a6f0cd7d3ebfcce082131f"`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "REL_ab40a6f0cd7d3ebfcce082131f" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "token" ALTER COLUMN "created" SET DEFAULT '2022-12-18 18:12:57.344'`);
        await queryRunner.query(`ALTER TABLE "appointment" ALTER COLUMN "modified" SET DEFAULT '2022-12-18 18:12:57.341'`);
        await queryRunner.query(`ALTER TABLE "appointment" ALTER COLUMN "created" SET DEFAULT '2022-12-18 18:12:57.341'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "modified" SET DEFAULT '2022-12-18 18:12:57.341'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "created" SET DEFAULT '2022-12-18 18:12:57.341'`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "PK_7b4e17a669299579dfa55a3fc35"`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "PK_fb2e442d14add3cefbdf33c4561" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
