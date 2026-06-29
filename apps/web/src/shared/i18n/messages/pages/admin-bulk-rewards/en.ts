export const adminBulkRewardsEn = {
  title: 'Bulk Rewards',
  subtitle:
    'Send rewards (coins, gems, arcadeum, or items) to all registered users.',
  form: {
    type: {
      label: 'Reward Type',
      coinsLabel: 'Coins',
      gemsLabel: 'Gems',
      arcadeumLabel: 'Arcadeum',
      itemLabel: 'Item',
    },
    amount: {
      label: 'Amount',
      placeholder: 'Enter amount',
    },
    itemId: {
      label: 'Item ID',
      placeholder: 'Enter catalog item ID',
    },
    reason: {
      label: 'Reason (optional)',
      placeholder: 'e.g. Holiday bonus, Compensation',
    },
    submit: 'Send to All Users',
    submitting: 'Sending...',
  },
  result: {
    success: 'Rewards sent successfully!',
    partial: 'Rewards partially sent.',
    statusFailed: 'Failed to send rewards.',
    total: 'Total users',
    successful: 'Successful',
    failed: 'Failed',
    errors: 'Errors',
  },
  confirm: {
    title: 'Confirm Bulk Reward',
    message:
      'This will send {amount} {type} to all registered users. Are you sure?',
    confirm: 'Confirm',
    cancel: 'Cancel',
  },
  validation: {
    amountRequired: 'Amount is required',
    itemIdRequired: 'Item ID is required for item rewards',
    invalidAmount: 'Amount must be between 1 and 1,000,000',
  },
};

export type AdminBulkRewardsI18n = typeof adminBulkRewardsEn;
