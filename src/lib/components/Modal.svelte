<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import { X } from '@lucide/svelte';

	interface ModalProps {
		open: boolean;
		onClose: () => void;
		children?: Snippet;
	}
	let { open, onClose, children }: ModalProps = $props();

	let dialogElement: HTMLDialogElement;
	const toDialogElement: Attachment<HTMLDialogElement> = (node) => {
		dialogElement = node;
	};

	$effect(() => {
		if (!dialogElement) return;
		if (open && !dialogElement.open) {
			dialogElement.showModal();
		} else if (!open && dialogElement.open) {
			dialogElement.close();
		}
	});

	function handleCancel(e: Event) {
		e.preventDefault();
		onClose();
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === dialogElement) onClose();
	}
	// width equal to col and banner is 69lvw
</script>

<dialog
	{@attach toDialogElement}
	aria-modal="true"
	oncancel={handleCancel}
	onclick={handleBackdropClick}
	class="h-[60lvh] w-[69lvw] place-self-center rounded-[0.5lvw] bg-white/10 backdrop-blur-xl"
>
	<div class="flex flex-col">
		<button type="button" onclick={onClose} class="self-end pt-[1lvh] pr-[1lvh]"
			><X size="5lvw" /></button
		>
		{@render children?.()}
	</div>
</dialog>
