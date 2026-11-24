/**
 * InfrastructureConfigService
 * Centralized, secure configuration service for all backend infrastructure,
 * Supabase integrations, storage, AI, email, and application environment settings.
 *
 * All secret keys are strictly server-side and never exposed to the client.
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
  isConfigured: boolean;
}

export interface ImageKitConfig {
  publicKey: string;
  privateKey?: string;
  urlEndpoint: string;
  isConfigured: boolean;
}

export interface EmailConfig {
  apiKey?: string;
  fromEmail: string;
  provider: 'resend' | 'console';
  isConfigured: boolean;
}

export interface AiConfig {
  apiKey?: string;
  model: string;
  provider: 'openrouter';
  isConfigured: boolean;
}

export interface AdminBootstrapConfig {
  email: string;
  secret: string;
}

export interface SystemConfig {
  appUrl: string;
  environment: 'development' | 'production' | 'test';
  supabase: SupabaseConfig;
  imagekit: ImageKitConfig;
  email: EmailConfig;
  ai: AiConfig;
  adminBootstrap: AdminBootstrapConfig;
}

class InfrastructureConfigService {
  private static instance: InfrastructureConfigService;

  private constructor() {}

  public static getInstance(): InfrastructureConfigService {
    if (!InfrastructureConfigService.instance) {
      InfrastructureConfigService.instance = new InfrastructureConfigService();
    }
    return InfrastructureConfigService.instance;
  }

  public getAppUrl(): string {
    return (
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000'
    );
  }

  public getEnvironment(): 'development' | 'production' | 'test' {
    const env = process.env.NODE_ENV;
    if (env === 'production') return 'production';
    if (env === 'test') return 'test';
    return 'development';
  }

  public getSupabaseConfig(): SupabaseConfig {
    const url =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      '';
    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    const isConfigured = Boolean(url && anonKey);

    return {
      url,
      anonKey,
      serviceRoleKey: typeof window === 'undefined' ? serviceRoleKey : undefined,
      isConfigured,
    };
  }

  public getImageKitConfig(): ImageKitConfig {
    const publicKey =
      process.env.IMAGEKIT_PUBLIC_KEY ||
      process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ||
      '';
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || '';
    const urlEndpoint =
      process.env.IMAGEKIT_URL_ENDPOINT ||
      process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ||
      '';

    const isConfigured = Boolean(publicKey && privateKey && urlEndpoint);

    return {
      publicKey,
      privateKey: typeof window === 'undefined' ? privateKey : undefined,
      urlEndpoint,
      isConfigured,
    };
  }

  public getEmailConfig(): EmailConfig {
    const apiKey = process.env.RESEND_API_KEY || '';
    const fromEmail = process.env.EMAIL_FROM || 'ExportFlow <noreply@exportflow.benzwell.com>';
    const isConfigured = Boolean(apiKey);

    return {
      apiKey: typeof window === 'undefined' ? apiKey : undefined,
      fromEmail,
      provider: isConfigured ? 'resend' : 'console',
      isConfigured,
    };
  }

  public getAiConfig(): AiConfig {
    const apiKey = process.env.OPENROUTER_API_KEY || '';
    const model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct';
    const isConfigured = Boolean(apiKey);

    return {
      apiKey: typeof window === 'undefined' ? apiKey : undefined,
      model,
      provider: 'openrouter',
      isConfigured,
    };
  }

  public getAdminBootstrapConfig(): AdminBootstrapConfig {
    return {
      email: process.env.ADMIN_BOOTSTRAP_EMAIL || 'info@benzwell.in',
      secret: process.env.ADMIN_BOOTSTRAP_SECRET || 'BenzwellAdmin2026!SecureKey',
    };
  }

  public getPublicConfig() {
    const supabase = this.getSupabaseConfig();
    return {
      appUrl: this.getAppUrl(),
      environment: this.getEnvironment(),
      supabaseUrl: supabase.url,
      imageKitPublicKey: this.getImageKitConfig().publicKey,
      imageKitUrlEndpoint: this.getImageKitConfig().urlEndpoint,
      features: {
        supabaseConfigured: supabase.isConfigured,
        aiEnabled: this.getAiConfig().isConfigured,
        emailEnabled: this.getEmailConfig().isConfigured,
      },
    };
  }
}

export const infraConfig = InfrastructureConfigService.getInstance();
