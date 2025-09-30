checkitout

## Code Style

This project uses **ESLint** and **Prettier** for consistent code style.

- Run `npm run lint` to check for lint errors.
- Run `npx prettier --write .` to auto-format code.

### Error Handling

- Resume upload shows user-friendly error banners for invalid file types, sizes, parsing failures, and file read errors.
- Profile form fields (email/phone) have inline validation and error messages.
