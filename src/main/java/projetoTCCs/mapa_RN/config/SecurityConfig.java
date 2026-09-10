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
                        // Libera expressamente arquivos estáticos comuns (css, js, imagens)
                        .requestMatchers("/css/**", "/js/**", "/*.css", "/*.js", "/login.html").permitAll()
                        // Rotas que exigem autenticação
                        .requestMatchers("/admin/**", "/painel-admin.html").authenticated()
                        // Todo as rotas restantes ficam livre
                        .anyRequest().permitAll()
                )
                .formLogin(form -> form
                        .loginPage("/login.html")
                        .loginProcessingUrl("/perform_login") // URL que o Spring intercepta para validar
                        .defaultSuccessUrl("/painel-admin.html", true)
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
        // Pega das variáveis de ambiente do sistema
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
