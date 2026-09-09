package projetoTCCs.mapa_RN.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // Rotas que exigem autenticação
                        .requestMatchers("/admin/**", "/painel-admin.html").authenticated()
                        // Todo o resto do site (mapa, buscas, cadastro público) fica livre
                        .anyRequest().permitAll()
                )
                .formLogin(form -> form
                        .loginPage("/login.html") // Página de login personalizada que vamos criar
                        .loginProcessingUrl("/perform_login") // URL que o Spring intercepta para validar
                        .defaultSuccessUrl("/painel-admin.html", true) // Para onde vai após logar com sucesso
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/index.html")
                        .permitAll()
                );

        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        // Pega das variáveis de ambiente do sistema ou usa padrão local para testes
        String user = System.getenv("ADMIN_USER") != null ? System.getenv("ADMIN_USER") : "admin";
        String pass = System.getenv("ADMIN_PASS") != null ? System.getenv("ADMIN_PASS") : "senha123";

        UserDetails admin = User.withDefaultPasswordEncoder()
                .username(user)
                .password(pass)
                .roles("ADMIN")
                .build();

        return new InMemoryUserDetailsManager(admin);
    }
}
