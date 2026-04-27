package com.art_nunki.nunki.repository;

import com.art_nunki.nunki.model.AuthSessionToken;
import com.art_nunki.nunki.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AuthSessionTokenRepository extends JpaRepository<AuthSessionToken, Long> {
    Optional<AuthSessionToken> findByTokenHash(String tokenHash);
    List<AuthSessionToken> findAllByUserAndRevokedAtIsNull(User user);
    void deleteAllByExpiresAtBefore(LocalDateTime dateTime);
    void deleteAllByUser(User user);
}
