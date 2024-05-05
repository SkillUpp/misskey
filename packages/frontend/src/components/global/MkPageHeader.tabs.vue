<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div>
	<div ref="el" :class="$style.tabs" @wheel="onTabWheel">
		<div :class="$style.tabsInner">
			<button
				v-for="t in tabs" :key="t.key" :ref="(el) => tabRefs[t.key] = (el as HTMLElement)"
				v-tooltip.noDelay="t.title" class="_button"
				:class="[$style.tab, { [$style.active]: t.key != null && t.key === props.tab, [$style.animate]: defaultStore.reactiveState.animation.value }]"
				@mousedown="(ev) => onTabMousedown(t, ev)" @click="(ev) => onTabClick(t, ev)"
			>
				<div :class="$style.tabInner">
					<i v-if="t.icon" :class="[$style.tabIcon, t.icon]"></i>
					<div
						v-if="!t.iconOnly || (!defaultStore.reactiveState.animation.value && t.key === tab)"
						:class="$style.tabTitle"
					>
						{{ t.title }}
					</div>
					<Transition
						v-else mode="in-out" @enter="enter" @afterEnter="afterEnter" @leave="leave"
						@afterLeave="afterLeave"
					>
						<div v-show="t.key === tab" :class="[$style.tabTitle, $style.animate]">{{ t.title }}</div>
					</Transition>
				</div>
			</button>
		</div>
		<div
			ref="tabHighlightEl"
			:class="[$style.tabHighlight, { [$style.animate]: defaultStore.reactiveState.animation.value }]"
		></div>
	</div>
	<div v-if="fillter" :class="$style.fillter">
		<div :class="$style.fillter_type">
			<MkSelect v-model="typeValue" small @update:modelValue="handleChangeSelect">
				<!-- <template #label>{{ typeValue }}</template> -->
				<!-- <select :class="$style.select" @change="handleChangeSelect"> -->
				<option value="all">All</option>
				<option value="hot">Hot</option>
				<option value="new">New</option>
				<!-- </select> -->
			</MkSelect>
		</div>
		<!-- <div :class="$style.fillter_type">
			<MkSelect v-model="layoutValue" small @update:modelValue="handleChangeLayout">
				<option value="view">View</option>
				<option value="card">Card</option>
				<option value="compact">Compact</option>
			</MkSelect>
		</div> -->
	</div>
</div>
</template>

<script lang="ts">
export type Tab = {
	key: string;
	title: string;
	onClick?: (ev: MouseEvent) => void;
} & (
		| {
			iconOnly?: false;
			title: string;
			icon?: string;
		}
		| {
			iconOnly: true;
			icon: string;
		}
	);
</script>

<script lang="ts" setup>
import { onMounted, onUnmounted, watch, nextTick, shallowRef, ref } from 'vue';
import { All } from '../MkAchievements.stories.impl';
import { defaultStore } from '@/store.js';
import MkSelect from '@/components/MkSelect.vue';

const props = withDefaults(defineProps<{
	tabs?: Tab[];
	tab?: string;
	rootEl?: HTMLElement;
	fillter?: boolean
}>(), {
	tabs: () => ([] as Tab[]),
});

const emit = defineEmits<{
	(ev: 'update:tab', key: string);
	(ev: 'tabClick', key: string);
	(ev: 'update:layout', key: string);
}>();

const typeValue = ref('all');
const layoutValue = ref('view');
const el = shallowRef<HTMLElement | null>(null);
const tabRefs: Record<string, HTMLElement | null> = {};
const tabHighlightEl = shallowRef<HTMLElement | null>(null);

function onTabMousedown(tab: Tab, ev: MouseEvent): void {
	// ユーザビリティの観点からmousedown時にはonClickは呼ばない
	if (tab.key) {
		emit('update:tab', tab.key);
	}
}

function onTabClick(t: Tab, ev: MouseEvent): void {
	emit('tabClick', t.key);
	localStorage.setItem('head_tab', t.key);
	if (t.onClick) {
		ev.preventDefault();
		ev.stopPropagation();
		t.onClick(ev);
	}

	if (t.key) {
		emit('update:tab', t.key);
	}
}

function handleChangeSelect(val) {
	// const val = event.target.value;
	typeValue.value = val;
	if (val !== 'hot') {
		const curTab = localStorage.getItem('head_tab');
		if (curTab) {
			emit('tabClick', curTab);
			emit('update:tab', curTab);
		}
		return;
	}
	emit('tabClick', val);
	if (val) {
		emit('update:tab', val);
		emit('tabClick', val);
		if (val) {
			emit('update:tab', val);
		}
	}
	emit('tabClick', val);
	if (val) {
		emit('update:tab', val);
	}
}

function handleChangeLayout(val) {
	layoutValue.value = val;
	emit('update:layout', val);
	// emit('tabClick', val);
	// if (val) {
	// 	emit('update:tab', val);
	// }
}

function handleChangeTab(key: string): void {
	emit('update:tab', key);
}

function handleChangeTabByIndex(index: number): void {
	const tab = props.tabs[index];
	if (tab) {
		emit('update:tab', tab.key);
	}
}

function renderTab() {
	const tabEl = props.tab ? tabRefs[props.tab] : undefined;
	if (tabEl && tabHighlightEl.value && tabHighlightEl.value.parentElement) {
		// offsetWidth や offsetLeft は少数を丸めてしまうため getBoundingClientRect を使う必要がある
		// https://developer.mozilla.org/ja/docs/Web/API/HTMLElement/offsetWidth#%E5%80%A4
		const parentRect = tabHighlightEl.value.parentElement.getBoundingClientRect();
		const rect = tabEl.getBoundingClientRect();
		tabHighlightEl.value.style.width = rect.width + 'px';
		tabHighlightEl.value.style.left = (rect.left - parentRect.left + tabHighlightEl.value.parentElement.scrollLeft) + 'px';
	}
}

function onTabWheel(ev: WheelEvent) {
	if (ev.deltaY !== 0 && ev.deltaX === 0) {
		ev.preventDefault();
		ev.stopPropagation();
		(ev.currentTarget as HTMLElement).scrollBy({
			left: ev.deltaY,
			behavior: 'instant',
		});
	}
	return false;
}

let entering = false;

async function enter(element: Element) {
	entering = true;
	const el = element as HTMLElement;
	const elementWidth = el.getBoundingClientRect().width;
	el.style.width = '0';
	el.style.paddingLeft = '0';
	el.offsetWidth; // force reflow
	el.style.width = elementWidth + 'px';
	el.style.paddingLeft = '';
	nextTick(() => {
		entering = false;
	});

	setTimeout(renderTab, 170);
}

function afterEnter(element: Element) {
	//el.style.width = '';
}

async function leave(element: Element) {
	const el = element as HTMLElement;
	const elementWidth = el.getBoundingClientRect().width;
	el.style.width = elementWidth + 'px';
	el.style.paddingLeft = '';
	el.offsetWidth; // force reflow
	el.style.width = '0';
	el.style.paddingLeft = '0';
}

function afterLeave(element: Element) {
	const el = element as HTMLElement;
	el.style.width = '';
}

let ro2: ResizeObserver | null;

onMounted(() => {
	watch([() => props.tab, () => props.tabs], () => {
		nextTick(() => {
			if (entering) return;
			renderTab();
		});
	}, {
		immediate: true,
	});

	if (props.rootEl) {
		ro2 = new ResizeObserver((entries, observer) => {
			if (document.body.contains(el.value as HTMLElement)) {
				nextTick(() => renderTab());
			}
		});
		ro2.observe(props.rootEl);
	}
});

onUnmounted(() => {
	if (ro2) ro2.disconnect();
});
</script>

<style lang="scss" module>
.tabs {
	display: block;
	position: relative;
	margin: 0;
	height: var(--height);
	font-size: 14px;
	text-align: center;
	overflow-x: auto;
	overflow-y: hidden;
	scrollbar-width: none;

	&::-webkit-scrollbar {
		display: none;
	}
}

.tabsInner {
	display: inline-block;
	height: var(--height);
	white-space: nowrap;
}

.tab {
	display: inline-block;
	position: relative;
	padding: 0 10px;
	height: 100%;
	font-weight: normal;
	opacity: 0.7;

	&:hover {
		opacity: 1;
	}

	&.active {
		opacity: 1;
	}

	&.animate {
		transition: opacity 0.2s ease;
	}
}

.tabInner {
	display: flex;
	align-items: center;
}

.tabIcon+.tabTitle {
	padding-left: 4px;
}

.tabTitle {
	overflow: hidden;

	&.animate {
		transition: width .15s linear, padding-left .15s linear;
	}
}

.tabHighlight {
	position: absolute;
	bottom: 0;
	height: 3px;
	background: #20d9bc;
	border-radius: 999px;
	transition: none;
	pointer-events: none;

	&.animate {
		transition: width 0.15s ease, left 0.15s ease;
	}
}

.fillter {
	position: absolute;
	left: 0;
	bottom: 4px;
	display: flex;
	align-items: center;
	height: 36px;
	// transform: translateX(-50%);

	.fillter_type {
		display: flex;
		align-items: center;
		padding: 0 16px;

		.select {
			height: 36px;
			padding: 0 6px;
			outline: none;
			border-radius: 4px;
			color: #576f76;
			border-color: none;

			option {
				color: #636363;
			}
		}
	}
}
</style>
