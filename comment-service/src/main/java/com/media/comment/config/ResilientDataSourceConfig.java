package com.media.comment.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.io.File;
import java.sql.Connection;

@Configuration
public class ResilientDataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(ResilientDataSourceConfig.class);

    @Value("${spring.datasource.url:jdbc:postgresql://localhost:5432/comment_db}")
    private String pgUrl;

    @Value("${spring.datasource.username:postgres}")
    private String pgUsername;

    @Value("${spring.datasource.password:postgres}")
    private String pgPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        log.info("Tentative de connexion initiale à PostgreSQL: {}", pgUrl);

        HikariConfig pgConfig = new HikariConfig();
        pgConfig.setDriverClassName("org.postgresql.Driver");
        pgConfig.setJdbcUrl(pgUrl);
        pgConfig.setUsername(pgUsername);
        pgConfig.setPassword(pgPassword);
        pgConfig.setConnectionTimeout(3000);
        pgConfig.setInitializationFailTimeout(3000);
        pgConfig.setValidationTimeout(2000);
        pgConfig.setMaximumPoolSize(10);
        pgConfig.setPoolName("PgPool-CommentService");

        HikariDataSource pgDataSource = null;
        try {
            pgDataSource = new HikariDataSource(pgConfig);
            try (Connection conn = pgDataSource.getConnection()) {
                log.info("Connexion à PostgreSQL réussie avec succès sur {} !", pgUrl);
                return pgDataSource;
            }
        } catch (Exception e) {
            log.warn("================================================================================");
            log.warn("[AUTO-RÉSOLUTION] Impossible de se connecter à PostgreSQL ({})", pgUrl);
            log.warn("Détail : {}", e.getMessage());
            log.warn("-> Activation automatique du moteur de base de données embarqué H2.");
            log.warn("-> Vos commentaires fonctionneront immédiatement sans aucun blocage !");
            log.warn("================================================================================");

            if (pgDataSource != null && !pgDataSource.isClosed()) {
                try {
                    pgDataSource.close();
                } catch (Exception ignored) {
                }
            }

            File dataDir = new File("./data");
            if (!dataDir.exists()) {
                dataDir.mkdirs();
            }

            HikariConfig h2Config = new HikariConfig();
            h2Config.setDriverClassName("org.h2.Driver");
            h2Config.setJdbcUrl("jdbc:h2:file:./data/comment_db;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1");
            h2Config.setUsername("sa");
            h2Config.setPassword("");
            h2Config.setPoolName("H2Pool-CommentService");
            h2Config.setMaximumPoolSize(10);

            return new HikariDataSource(h2Config);
        }
    }
}
