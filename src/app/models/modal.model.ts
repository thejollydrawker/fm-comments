export interface ModalContent {
    title: string;
    body: string;
    showButtons: boolean;
    showClose?: boolean;
    cancelAction: () => void;
    applyAction: () => void;
    cancelBtnText?: string;
    applyBtnText?: string;
  }