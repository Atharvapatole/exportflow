/**
 * InfrastructureConfigService
 * Centralized, secure configuration service for all backend infrastructure,
 * external API integrations, storage, and application environment settings.
 *
 * All secret keys are strictly server-side and never exposed to the client.
 */

export interface AppwriteConfig {
  endpoint: string;
  projectId: string;
  apiKey?: string;
  databaseId: string;
  bucketId: string;
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
  appwrite: AppwriteConfig;
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

  public getAppwriteConfig(): AppwriteConfig {
    const endpoint =
      process.env.APPWRITE_ENDPOINT ||
      process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
      'https://cloud.appwrite.io/v1';
    const projectId =
      process.env.APPWRITE_PROJECT_ID ||
      process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ||
      '';
    const apiKey = process.env.APPWRITE_API_KEY || '';
    const databaseId = process.env.APPWRITE_DATABASE_ID || 'exportflow_db';
    const bucketId = process.env.APPWRITE_BUCKET_ID || 'exportflow_documents';

    const isConfigured = Boolean(projectId && apiKey);

    return {
      endpoint,
      projectId,
      apiKey: typeof window === 'undefined' ? apiKey : undefined,
      databaseId,
      bucketId,
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
      email: process.env.ADMIN_BOOTSTRAP_EMAIL || 'admin@benzwell.com',
      secret: process.env.ADMIN_BOOTSTRAP_SECRET || 'BenzwellAdmin2026!SecureKey',
    };
  }

  public getPublicConfig() {
    return {
      appUrl: this.getAppUrl(),
      environment: this.getEnvironment(),
      appwriteEndpoint: this.getAppwriteConfig().endpoint,
      appwriteProjectId: this.getAppwriteConfig().projectId,
      imageKitPublicKey: this.getImageKitConfig().publicKey,
      imageKitUrlEndpoint: this.getImageKitConfig().urlEndpoint,
      features: {
        aiEnabled: this.getAiConfig().isConfigured,
        emailEnabled: this.getEmailConfig().isConfigured,
        cloudStorageEnabled: this.getAppwriteConfig().isConfigured,
      },
    };
  }
}

export const infraConfig = InfrastructureConfigService.getInstance();
