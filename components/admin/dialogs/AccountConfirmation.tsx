"use client";

import ConfirmationDialog from "./ConfirmationDialog";
import { updateAccountStatus } from "@/lib/admin/actions/user";

const AccountConfirmation = ({ user }: { user: User }) => {
  const confirmationAction =
    user.status === "PENDING" || user.status === "REJECTED"
      ? "approve"
      : "deny";

  const title =
    confirmationAction === "approve"
      ? "Approve Account Request"
      : "Deny Account Request";

  const description =
    confirmationAction === "approve"
      ? "Approve the student’s account request and grant access"
      : "Denying this request will reject the student's account creation request due to unsuccessful ID card verification.";

  const triggerLabel =
    confirmationAction === "approve" ? "Approve Account" : "Revoke Account";

  const confirmLabel =
    confirmationAction === "approve"
      ? "Approve"
      : "Deny Student";

  const iconSrc =
    confirmationAction === "approve"
      ? "/icons/admin/info.svg"
      : "/icons/admin/tick.svg";

  const handleConfirm = () => {
    if (confirmationAction === "approve") {
      updateAccountStatus({
        userId: user.id,
        status: "APPROVED",
      });
    } else {
      updateAccountStatus({
        userId: user.id,
        status: "REJECTED",
      });
    }
  };

  return (
    <ConfirmationDialog
      variant={confirmationAction}
      title={title}
      description={description}
      triggerLabel={triggerLabel}
      onConfirm={handleConfirm}
      confirmLabel={confirmLabel}
      iconSrc={iconSrc}
    />
  );
};

export default AccountConfirmation;
