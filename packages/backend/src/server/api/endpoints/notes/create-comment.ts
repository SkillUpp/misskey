/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import type { MiCommentRepository, NotesRepository } from '@/models/_.js';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { DI } from '@/di-symbols.js';
import { IdService } from '@/core/IdService.js';

export const meta = {
	tags: ['notes'],

	requireCredential: true,
	requireAdmin: true,
	kind: 'write:notes',
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		noteId: { type: 'string', format: 'misskey:id' },
		text: { type: 'string' },
	},
	required: ['noteId'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.notesRepository)
		private notesRepository: NotesRepository,
		private idService: IdService,

		@Inject(DI.commentRepository)
		private commentRepository: MiCommentRepository,
	) {
		super(meta, paramDef, async (ps, me) => {
			const result =	await this.commentRepository.save({
				id: this.idService.gen(),
				userId: me.id,
				replyId: ps.noteId,
				text: ps.text,
				createdAt: new Date(),
			});

			await	this.notesRepository.increment({ id: ps.noteId }, 'repliesCount', 1);
			return {
				id: result.id,
				noteId: ps.noteId,
				text: result.text,
			};
		});
	}
}
