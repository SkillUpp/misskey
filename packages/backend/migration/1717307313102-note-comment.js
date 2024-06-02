/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class NoteComment1717307313102 {
    name = 'NoteComment1717307313102'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "note_comment" (
					"id" CHARACTER VARYING ( 32 ) NOT NULL,
					"userId" CHARACTER VARYING ( 32 ) NOT NULL,
					"createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
					"replyId" CHARACTER VARYING ( 32 ) NOT NULL,
				"text" text NOT NULL DEFAULT '',
				CONSTRAINT "PK_a75395fe471730731313b50d7ea" PRIMARY KEY ( "id" ))`);
        await queryRunner.query(`CREATE INDEX "IDX_75276757070d21f71730731310" ON "note_comment" ("replyId") `);
        await queryRunner.query(`ALTER TABLE "note_comment" ADD CONSTRAINT "FK_75270731313b50d7eaf4c052909" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "note_comment"`);
    }
}
