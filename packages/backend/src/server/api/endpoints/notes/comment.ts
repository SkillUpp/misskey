/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import type { MiCommentRepository } from '@/models/_.js';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { DI } from '@/di-symbols.js';
import { UserEntityService } from '@/core/entities/UserEntityService.js';

export const meta = {
	tags: ['notes'],

	requireCredential: false,

	res: {
		type: 'array',
		optional: false, nullable: false,
		// items: {
		// 	type: 'object',
		// 	optional: false, nullable: false,
		// 	ref: 'Note',
		// },
		items: {
			type: 'object',
			optional: false, nullable: false,
			properties: {
				id: {
					type: 'string', format: 'misskey:id',
					optional: false, nullable: false,
				},
				text: {
					type: 'string',
					optional: false, nullable: false,
				},
				user: {
					type: 'object',
					optional: true, nullable: false,
					ref: 'UserLite',
				},
			},
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		noteId: { type: 'string', format: 'misskey:id' },
	},
	required: ['noteId'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		private userEntityService: UserEntityService,
		@Inject(DI.commentRepository)
		private commentRepository: MiCommentRepository,
	) {
		super(meta, paramDef, async (ps, me) => {
			const records = await this.commentRepository.find({
				where: {
					replyId: ps.noteId,
				},
				order: {
					createdAt: 'DESC',
				},
				take: 10,
				relations: ['user'],
			});

			const users = await this.userEntityService.packMany(records.map(r => r.user!), null);

			return records.map(r => ({
				id: r.id,
				text: r.text,
				user: users.find(u => u.id === r.user!.id),
			}));
		});
	}
}
