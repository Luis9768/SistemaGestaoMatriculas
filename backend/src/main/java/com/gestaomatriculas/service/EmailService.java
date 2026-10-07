package com.gestaomatriculas.service;

import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailService {

    @Value("${resend.api.key:${RESEND_API_KEY:}}")
    private String resendApiKey;

    @Value("${resend.from.email:${RESEND_FROM_EMAIL:onboarding@resend.dev}}")
    private String fromEmail;

    /**
     * Envia o código institucional de recuperação de 7 dígitos via Resend.
     *
     * @param paraEmail Endereço de e-mail do destinatário
     * @param codigo    Código de verificação de 7 dígitos
     */
    public void enviarCodigoRecuperacao(String paraEmail, String codigo) {
        String chave = resendApiKey != null ? resendApiKey.trim() : "";

        if (chave.isEmpty()) {
            log.warn("[RESEND] Chave RESEND_API_KEY não configurada. E-mail simulado no console para: {} [CÓDIGO: {}]", paraEmail, codigo);
            return;
        }

        try {
            Resend resend = new Resend(chave);
            String remetente = (fromEmail != null && !fromEmail.trim().isEmpty())
                    ? fromEmail.trim()
                    : "onboarding@resend.dev";

            String htmlTemplate = """
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
                    <div style="margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px;">
                        <span style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #64748b;">Prefeitura de Santo André &bull; Secretaria de Cultura</span>
                        <h2 style="margin: 8px 0 0 0; font-size: 20px; font-weight: 700; color: #0f172a;">Recuperação de Acesso Institucional</h2>
                        <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Sistema de Gestão de Matrículas das Escolas Livres</p>
                    </div>

                    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 16px 0;">
                        Olá, você solicitou a recuperação de acesso ao portal administrativo. Utilize o código de segurança abaixo para confirmar sua identidade e cadastrar sua nova senha:
                    </p>

                    <div style="background-color: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 600; display: block; margin-bottom: 8px;">Código de Verificação</span>
                        <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; font-family: ui-monospace, Menlo, Monaco, 'Courier New', monospace; color: #0f172a;">%s</span>
                    </div>

                    <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 16px 0;">
                        &bull; Este código expira em <strong>10 minutos</strong>.<br/>
                        &bull; O código é de uso estritamente pessoal e confidencial.<br/>
                        &bull; Se você não solicitou esta redefinição, desconsidere esta mensagem.
                    </p>

                    <div style="margin-top: 32px; pt: 16px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; text-align: center;">
                        Escolas Livres de Santo André &mdash; Teatro &bull; Dança &bull; Cinema & Vídeo &bull; Iniciação Artística
                    </div>
                </div>
            """.formatted(codigo);

            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from(remetente)
                    .to(paraEmail.trim().toLowerCase())
                    .subject("Código de Recuperação de Acesso - Escolas Livres de Santo André")
                    .html(htmlTemplate)
                    .build();

            CreateEmailResponse response = resend.emails().send(params);
            log.info("[RESEND] E-mail de recuperação enviado com sucesso para {} [ID: {}]", paraEmail, response.getId());

        } catch (Exception e) {
            log.error("[RESEND] Falha no envio de e-mail para {}: {}", paraEmail, e.getMessage(), e);
            // Mantém a execução sem estourar 500 no cliente caso o Resend tenha instabilidade temporária
        }
    }
}
