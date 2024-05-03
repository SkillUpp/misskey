<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<script lang="ts">
import { defineComponent, h, resolveDirective, withDirectives } from 'vue';

export default defineComponent({
	props: {
		modelValue: {
			required: true,
		},
	},
	setup(props, { emit, slots }) {
		const options = slots.default?.() ?? [];

		return () => h('div', {
			class: 'pxhvhrfw',
		}, options.map(option => withDirectives(h('button', {
			class: ['_button', { active: props.modelValue === option.props?.value }],
			key: option.key as string,
			disabled: props.modelValue === option.props?.value,
			onClick: () => {
				emit('update:modelValue', option.props?.value);
			},
		}, option.children ?? []), [
			[resolveDirective('click-anime')],
		])));
	},
});
</script>

<style lang="scss">
.pxhvhrfw {
	display: flex;
	align-items: center;
	height: 56px;
	font-size: 16px;
	background: #fff;
	padding: 0 24px;
	// margin-top: -24px;
	// margin-left: -24px;
	// margin-right: -24px;
	border-bottom: solid 1px var(--divider);

	> button {
		// flex: 1;
		// padding: 10px 8px;
		// border-radius: 16px;
		padding: 16px;
		color: #636363;
    font-weight: 500;

		&:disabled {
			opacity: 1 !important;
			cursor: default;
		}

		&.active {
			color: #20d9bc;
			background: #fff;
			border-bottom: 2px solid #20d9bc;
		}

		&:not(.active):hover {
			opacity: .7;
		}

		&:not(:first-child) {
			margin-left: 36px;
		}

		> .icon {
			margin-right: 6px;
		}
	}
}

@container (max-width: 500px) {
	.pxhvhrfw {
		font-size: 80%;

		> button {
			padding: 11px 8px;
		}
	}
}
</style>
