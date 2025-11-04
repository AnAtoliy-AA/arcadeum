module.exports = {
  "fe/**/*.{ts,tsx,js,jsx}": [
    "npm --prefix fe exec -- eslint --max-warnings=0 --fix",
    "npm --prefix fe exec -- prettier --write"
  ],
  "fe/**/*.{json,md,yml,yaml}": [
    "npm --prefix fe exec -- prettier --write"
  ],
  "be/**/*.{ts,js}": [
    "npm --prefix be exec -- eslint --max-warnings=0 --fix",
    "npm --prefix be exec -- prettier --write"
  ],
  "be/**/*.{json,md,yml,yaml}": [
    "npm --prefix be exec -- prettier --write"
  ]
};
