package com.art_nunki.nunki.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
public class DataSourceConfig {

    @Bean
    @Primary
    public DataSource dataSource(
            @Value("${spring.datasource.url:jdbc:h2:file:./data/artshare}") String rawUrl,
            @Value("${spring.datasource.username:sa}") String username,
            @Value("${spring.datasource.password:}") String password,
            @Value("${spring.datasource.driver-class-name:}") String driverClassName
    ) {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl(normalizeJdbcUrl(rawUrl));
        dataSource.setUsername(username);
        dataSource.setPassword(password);

        if (driverClassName != null && !driverClassName.isBlank()) {
            dataSource.setDriverClassName(driverClassName);
        }

        return dataSource;
    }

    private String normalizeJdbcUrl(String rawUrl) {
        if (rawUrl == null || rawUrl.isBlank()) {
            return "jdbc:h2:file:./data/artshare";
        }

        if (rawUrl.startsWith("jdbc:")) {
            return rawUrl;
        }

        if (rawUrl.startsWith("postgresql://") || rawUrl.startsWith("postgres://")) {
            return toPostgresJdbcUrl(rawUrl);
        }

        return rawUrl;
    }

    private String toPostgresJdbcUrl(String rawUrl) {
        try {
            URI uri = new URI(rawUrl);
            String scheme = uri.getScheme();
            String host = uri.getHost();
            int port = uri.getPort();
            String path = uri.getPath();
            String query = uri.getQuery();

            if (host == null || host.isBlank() || path == null || path.isBlank()) {
                return rawUrl;
            }

            StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://");
            jdbcUrl.append(host);

            if (port > 0) {
                jdbcUrl.append(":").append(port);
            }

            jdbcUrl.append(path);

            if (query != null && !query.isBlank()) {
                jdbcUrl.append("?").append(query);
            }

            return jdbcUrl.toString();
        } catch (URISyntaxException ignored) {
            return rawUrl;
        }
    }
}
