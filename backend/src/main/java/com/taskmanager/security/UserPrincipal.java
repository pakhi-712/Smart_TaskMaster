package com.taskmanager.security;

import com.taskmanager.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class UserPrincipal implements UserDetails {

    private Long id;
    private String email;
    private String password;
    private String name;

    public UserPrincipal(Long id, String email, String password, String name) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.name = name;
    }

    // Factory method: converts your User entity into a UserPrincipal.
    // Called by JwtAuthFilter after loading the user from the database.
    public static UserPrincipal fromUser(User user) {
        return new UserPrincipal(
            user.getId(),
            user.getEmail(),
            user.getPassword(),
            user.getName()
        );
    }

    // ---- Your custom getters ----

    public Long getId() { return id; }
    public String getName() { return name; }

    // ---- UserDetails interface methods ----
    // Spring Security calls these internally to check authentication.
    // We must implement all of them because UserDetails is an interface.

    @Override
    public String getUsername() { return email; }

    @Override
    public String getPassword() { return password; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.emptyList();
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}