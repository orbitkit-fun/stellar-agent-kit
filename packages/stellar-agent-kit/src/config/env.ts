import { z } from "zod";

export type EnvSource = Record<string, string | undefined>;

type EnvAlternativeGroup = {
  vars: string[];
  label?: string;
};

type ValidateEnvOptions = {
  context?: string;
  source?: EnvSource;
  required?: string[];
  oneOf?: Array<string[] | EnvAlternativeGroup>;
};

const EnvValueSchema = z.string().trim().min(1);

function normalizeGroup(group: string[] | EnvAlternativeGroup): EnvAlternativeGroup {
  return Array.isArray(group) ? { vars: group } : group;
}

export function readEnv(source: EnvSource, name: string): string | undefined {
  const parsed = EnvValueSchema.safeParse(source[name]);
  return parsed.success ? parsed.data : undefined;
}

export function pickEnv(source: EnvSource, names: string[]): string | undefined {
  for (const name of names) {
    const value = readEnv(source, name);
    if (value) return value;
  }
  return undefined;
}

export function validateEnv(options: ValidateEnvOptions = {}): EnvSource {
  const source = options.source ?? (process.env as EnvSource);
  const missingLines: string[] = [];

  for (const name of options.required ?? []) {
    if (!readEnv(source, name)) {
      missingLines.push(`- \`${name}\``);
    }
  }

  for (const rawGroup of options.oneOf ?? []) {
    const group = normalizeGroup(rawGroup);
    if (!pickEnv(source, group.vars)) {
      const suffix = group.label ? ` (${group.label})` : "";
      missingLines.push(`- one of ${group.vars.map((name) => `\`${name}\``).join(", ")}${suffix}`);
    }
  }

  if (missingLines.length > 0) {
    const context = options.context ?? "application startup";
    throw new Error(
      `Missing environment variables for ${context}:\n${missingLines.join("\n")}\nSet the missing values in your shell or .env file and restart the process.`
    );
  }

  return source;
}
