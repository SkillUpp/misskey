/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class FollowUserChannelFollowing1717257906063 {
    name = 'FollowUserChannelFollowing1717257906063'

    async up(queryRunner) {
			await queryRunner.query(`ALTER TABLE "channel_following" ADD "createdAt" TIMESTAMP WITH TIME ZONE `);

    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "channel_following" DROP COLUMN "createdAt"`);
    }
}
