---
name: form-patterns
description: Implement accessible forms with proper validation, error handling, and progressive disclosure. Use when building forms, adding validation, or improving form UX. Trigger on keywords like form, validation, input, error, submit, field.
---

# Form Patterns Skill

Implement accessible forms with proper validation, error handling, and progressive disclosure.

## When to Use

- Building new forms (login, signup, settings)
- Adding form validation
- Improving form error handling
- Implementing multi-step forms
- Optimizing form UX

## Core Principles

1. **Visible labels** — Always show labels, never rely on placeholders
2. **Clear errors** — Show errors near the field, not at the top
3. **Progressive disclosure** — Reveal complexity gradually
4. **Accessible** — Screen readers must announce all states

## Form Structure

### Basic Form

```tsx
import { Input, Button } from '@arcadeum/ui';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    if (!email.includes('@')) newErrors.email = 'Invalid email';
    if (!password) newErrors.password = 'Password is required';
    if (password.length < 8) newErrors.password = 'Password must be 8+ characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="box-border flex flex-col gap-4 p-4">
      <FormField
        label="Email"
        value={email}
        onChange={setEmail}
        error={errors.email}
        type="email"
        autoComplete="email"
      />
      <FormField
        label="Password"
        value={password}
        onChange={setPassword}
        error={errors.password}
        type="password"
        autoComplete="current-password"
      />
      {errors.submit && <ErrorMessage message={errors.submit} />}
      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Signing in...' : 'Sign in'}
      </Button>
    </div>
  );
};
```

### Form Field Component

```tsx
const FormField = ({
  label,
  value,
  onChange,
  error,
  hint,
  required,
  disabled,
  ...inputProps
}) => {
  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  return (
    <div className="box-border flex flex-col gap-1">
      <label htmlFor={fieldId}>
        {label}
        {required && <span className="text-[var(--error)]">*</span>}
      </label>
      <Input
        id={fieldId}
        value={value}
        onChange={onChange}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        disabled={disabled}
        className={error ? 'border-[var(--error)]' : undefined}
        {...inputProps}
      />
      {hint && !error && (
        <p id={hintId} className="text-sm text-[var(--textSecondary)]">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-[var(--error)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
```

## Validation Patterns

### On Blur (Recommended)

```tsx
const [touched, setTouched] = useState({});
const [errors, setErrors] = useState({});

const handleBlur = (field) => {
  setTouched({ ...touched, [field]: true });
  validateField(field);
};

const validateField = (field) => {
  const error = validate[field](values[field]);
  setErrors({ ...errors, [field]: error });
};

// Show error only after field is touched
<Input
  onBlur={() => handleBlur('email')}
  aria-invalid={touched.email && !!errors.email}
/>
```

### On Submit

```tsx
const handleSubmit = () => {
  const errors = validateAll(values);
  if (Object.keys(errors).length > 0) {
    setErrors(errors);
    // Focus first error field
    const firstErrorField = Object.keys(errors)[0];
    fieldRefs[firstErrorField]?.focus();
  } else {
    submitForm(values);
  }
};
```

### Inline Validation

```tsx
const [emailStatus, setEmailStatus] = useState('idle');

const handleEmailChange = async (email) => {
  setEmail(email);
  if (!email) {
    setEmailStatus('idle');
    return;
  }
  setEmailStatus('checking');
  const exists = await checkEmailExists(email);
  setEmailStatus(exists ? 'taken' : 'available');
};

<Input
  value={email}
  onChange={handleEmailChange}
  rightIcon={
    emailStatus === 'checking' && <Spinner size="small" />
    emailStatus === 'taken' && <span className="text-sm text-[var(--error)]">Taken</span>
    emailStatus === 'available' && <span className="text-sm text-[var(--success)]">Available</span>
  }
/>
```

## Error Handling

### Error Message Guidelines

| Do | Don't |
|----|-------|
| "Password must be 8+ characters" | "Invalid password" |
| "Email is required" | "Error" |
| "Please enter a valid email" | "Wrong format" |
| "Passwords don't match" | "Mismatch" |

### Error Placement

```tsx
// Below the field (recommended)
<FormField
  label="Email"
  error={errors.email}  // Shows below input
/>

// Summary at top (for multiple errors)
{hasErrors && (
  <Alert type="error">
    <p>Please fix the following errors:</p>
    <List>
      {Object.entries(errors).map(([field, error]) => (
        <ListItem key={field}>
          <Link href={`#${field}`}>{error}</Link>
        </ListItem>
      ))}
    </List>
  </Alert>
)}
```

### Accessible Errors

```tsx
// Link error to field
<Input
  aria-describedby="email-error"
  aria-invalid={!!error}
/>
<p id="email-error" className="text-sm text-[var(--error)]" role="alert">
  {error}
</p>

// Live region for dynamic errors
<div aria-live="polite">
  {error && <p role="alert">{error}</p>}
</div>
```

## Progressive Disclosure

### Multi-Step Forms

```tsx
const [step, setStep] = useState(1);

const steps = [
  { title: 'Account', fields: ['email', 'password'] },
  { title: 'Profile', fields: ['name', 'bio'] },
  { title: 'Preferences', fields: ['theme', 'notifications'] },
];

return (
  <div className="box-border flex flex-col gap-2">
    <StepIndicator current={step} total={steps.length} />
    <FormStep step={steps[step - 1]} />
    <div className="box-border flex flex-row gap-2">
      {step > 1 && <Button onClick={() => setStep(step - 1)}>Back</Button>}
      <Button onClick={() => setStep(step + 1)}>
        {step === steps.length ? 'Submit' : 'Next'}
      </Button>
    </div>
  </div>
);
```

### Conditional Fields

```tsx
const [accountType, setAccountType] = useState('personal');

<RadioGroup value={accountType} onValueChange={setAccountType}>
  <RadioGroup.Item value="personal">Personal</RadioGroup.Item>
  <RadioGroup.Item value="business">Business</RadioGroup.Item>
</RadioGroup>

{accountType === 'business' && (
  <FormField
    label="Company Name"
    value={companyName}
    onChange={setCompanyName}
  />
)}
```

### Expandable Sections

```tsx
const [showAdvanced, setShowAdvanced] = useState(false);

<BasicFields />

<Collapsible>
  <Button onClick={() => setShowAdvanced(!showAdvanced)}>
    {showAdvanced ? 'Hide' : 'Show'} Advanced Options
  </Button>
</Collapsible>

{showAdvanced && (
  <AdvancedFields />
)}
```

## Form Accessibility

### Labels

```tsx
// Always visible label
<label htmlFor="email">Email</label>
<Input id="email" />

// Or floating label
<FloatingLabelInput
  label="Email"
  value={email}
  onChange={setEmail}
/>
```

### Required Fields

```tsx
<label>
  Email <span className="text-[var(--error)]" aria-hidden>*</span>
</label>
<Input
  required
  aria-required="true"
/>
```

### Disabled States

```tsx
<Input
  disabled
  aria-disabled="true"
  className="opacity-50"
/>
```

### Loading States

```tsx
<Button
  disabled={loading}
  aria-busy={loading}
>
  {loading ? <Spinner size="small" /> : 'Submit'}
</Button>
```

## Checklist

- [ ] All inputs have visible labels
- [ ] Required fields marked with asterisk and `aria-required`
- [ ] Errors shown below each field
- [ ] Errors linked with `aria-describedby`
- [ ] Errors announced with `role="alert"`
- [ ] Focus moves to first error on submit
- [ ] Loading states use `aria-busy`
- [ ] Disabled states use `aria-disabled`
- [ ] Multi-step forms show progress
- [ ] Complex forms use progressive disclosure
- [ ] All fields keyboard accessible
- [ ] Touch targets ≥ 44px
