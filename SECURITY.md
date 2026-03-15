# Security Policy

## Supported Versions

The following versions of **osn.** receive security updates:

| Version | Supported |
|---------|-----------|
| 0.1.x   | Yes       |

Only the latest release within each supported major/minor version line receives patches.

---

## Reporting a Vulnerability

If you discover a security vulnerability in **osn.**, please report it responsibly. **Do not open a public issue.**

### How to Report

Send a detailed report to the project maintainers via GitHub's private vulnerability reporting feature, or contact the maintainers directly through the communication channels listed in the repository.

### What to Include

- A clear description of the vulnerability.
- Steps to reproduce the issue.
- The potential impact and severity.
- Any suggested remediation, if available.

### Response Timeline

- **Acknowledgment**: Within 48 hours of receiving the report.
- **Initial Assessment**: Within 5 business days.
- **Resolution**: Dependent on severity. Critical vulnerabilities are prioritized for immediate patching.

### Process

1. The report is received and acknowledged.
2. The maintainers investigate and confirm the vulnerability.
3. A fix is developed and tested privately.
4. A security advisory is published alongside the patched release.
5. The reporter is credited in the advisory, unless anonymity is requested.

---

## Scope

This policy applies to the following packages:

- `@osndot/osn` (Core CLI)
- `@osndot/sdk` (Plugin SDK)
- `@osndot/plugin-git`
- `@osndot/plugin-docker`
- `@osndot/plugin-env`

Third-party plugins developed outside of this repository are not covered by this policy. Vulnerabilities in third-party plugins should be reported to their respective maintainers.

---

## Security Practices

The **osn.** project follows these security practices:

- **Dependency Management**: Dependencies are regularly audited using `pnpm audit` and kept up to date.
- **Input Validation**: User-provided configuration is validated at runtime using Zod schemas.
- **Principle of Least Privilege**: Plugins operate within a sandboxed context and do not have access to internal CLI state.
- **No Credential Storage**: **osn.** does not store, transmit, or process user credentials or sensitive tokens.
- **CI/CD Security**: Automated pipelines enforce build, test, and type-check gates before any release.

---

## Acknowledgments

We appreciate the efforts of security researchers and community members who help keep **osn.** safe. Responsible disclosures will be acknowledged in release notes unless the reporter requests otherwise.
