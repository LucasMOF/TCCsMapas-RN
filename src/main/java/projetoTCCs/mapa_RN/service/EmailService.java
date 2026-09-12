package projetoTCCs.mapa_RN.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String remetente;

    public void enviarEmailStatus(String destinatario, String tituloTcc, String status, String motivoRejeicao) {
        if (destinatario == null || destinatario.trim().isEmpty()) {
            System.out.println("Nenhum e-mail de contato informado. Notificação ignorada.");
            return;
        }

        try {
            SimpleMailMessage mensagem = new SimpleMailMessage();
            mensagem.setFrom(remetente);
            mensagem.setTo(destinatario);

            if ("APROVADO".equalsIgnoreCase(status) || "APROVAR".equalsIgnoreCase(status)) {
                mensagem.setSubject("TCC Aprovado e Publicado - Mapa RN");
                mensagem.setText("Olá!\n\nSeu TCC com o título \"" + tituloTcc + "\" foi APROVADO e já está publicado na plataforma do Mapa RN.\n\nObrigado por contribuir com a nossa base de conhecimento acadêmico!");
            } else {
                mensagem.setSubject("Atualização sobre o seu TCC - Mapa RN");
                mensagem.setText("Olá!\n\nRecebemos o cadastro do TCC \"" + tituloTcc + "\". Infelizmente, ele não foi aprovado pela curadoria nesta ocasião.\n\nMotivo informado:\n" + (motivoRejeicao != null && !motivoRejeicao.isEmpty() ? motivoRejeicao : "Não especificado") + "\n\nCaso tenha dúvidas, entre em contato com a equipe.");
            }

            mailSender.send(mensagem);
            System.out.println("E-mail de notificação enviado com sucesso para: " + destinatario);
        } catch (Exception e) {
            System.err.println("Erro ao enviar e-mail: " + e.getMessage());
            throw new RuntimeException("Falha de autenticação ou erro no envio do e-mail. Ação cancelada.");
        }
    }

}
