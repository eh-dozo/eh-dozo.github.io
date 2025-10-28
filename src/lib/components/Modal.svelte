<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Attachment } from 'svelte/attachments';

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
</script>

<dialog
	{@attach toDialogElement}
	aria-modal="true"
	oncancel={handleCancel}
	onclick={handleBackdropClick}
	class="h-[80lvh] w-[82.5lvw] place-self-center"
>
	<button type="button" onclick={onClose}>Close</button>
	{@render children?.()}
</dialog>
