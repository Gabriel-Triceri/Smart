package com.smartmeeting.security;

import com.smartmeeting.api.SmartmeetingApiApplication;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = SmartmeetingApiApplication.class)
@AutoConfigureMockMvc
public class PermissionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Test
    public void permissionsEndpoint_WithValidJwt_ShouldReturn200() throws Exception {
        // Crie um usuário de teste com as permissões necessárias
        UserDetails userDetails = customUserDetailsService.loadUserByUsername("alice.admin@smart.com");
        Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        String token = jwtTokenProvider.generateToken(authentication);

        mockMvc.perform(get("/ws/permissions")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }
}
