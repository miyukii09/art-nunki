package com.art_nunki.nunki.repository;

import com.art_nunki.nunki.model.PasswordResetToken;
import com.art_nunki.nunki.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByTokenHash(String tokenHash);
    List<PasswordResetToken> findAllByUserAndUsedAtIsNull(User user);
    void deleteAllByUser(User user);
    void deleteAllByExpiresAtBefore(LocalDateTime dateTime);
}
