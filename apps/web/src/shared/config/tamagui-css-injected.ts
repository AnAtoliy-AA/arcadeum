let injected = false;

export const wasTamaguiCSSInjected = () => injected;
export const markTamaguiCSSInjected = () => {
  injected = true;
};
export const resetTamaguiCSSInjection = () => {
  injected = false;
};
