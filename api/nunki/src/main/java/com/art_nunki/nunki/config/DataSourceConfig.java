package com.art_nunki.nunki.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

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

        if (rawUrl.startsWith("postgresql://")) {
            return "jdbc:" + rawUrl;
        }

        if (rawUrl.startsWith("postgres://")) {
            return "jdbc:postgresql://" + rawUrl.substring("postgres://".length());
        }

        return rawUrl;
    }
}
