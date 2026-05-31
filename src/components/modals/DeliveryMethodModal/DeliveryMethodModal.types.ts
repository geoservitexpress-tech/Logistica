export interface DeliveryMethodModalProps {
  visible: boolean;

  onClose: () => void;

  onPickup: () => void;

  onPhysicalPoint: () => void;
}