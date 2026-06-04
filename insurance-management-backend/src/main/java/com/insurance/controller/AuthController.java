package com.insurance.controller;

import com.insurance.dto.JwtResponseDto;
import com.insurance.dto.LoginRequestDto;
import com.insurance.dto.SignupRequestDto;
import com.insurance.dto.MessageResponse;
import com.insurance.entity.ERole;
import com.insurance.entity.Role;
import com.insurance.entity.User;
import com.insurance.repository.RoleRepository;
import com.insurance.entity.Customer;
import com.insurance.repository.CustomerRepository;
import com.insurance.repository.UserRepository;
import com.insurance.repository.PasswordResetTokenRepository;
import com.insurance.repository.EmailOtpTokenRepository;
import com.insurance.service.EmailService;
import com.insurance.entity.EmailOtpToken;
import com.insurance.security.JwtTokenProvider;
import com.insurance.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Value("${oauth2.google.client-id}")
    private String googleClientId;

    @Value("${oauth2.google.client-secret}")
    private String googleClientSecret;

    @Value("${oauth2.google.redirect-uri}")
    private String googleRedirectUri;

    @Value("${oauth2.facebook.client-id}")
    private String facebookClientId;

    @Value("${oauth2.facebook.client-secret}")
    private String facebookClientSecret;

    @Value("${oauth2.facebook.redirect-uri}")
    private String facebookRedirectUri;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private com.insurance.service.SystemLogService systemLogService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequestDto loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtTokenProvider.generateJwtToken(authentication);
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String role = userDetails.getAuthorities().stream()
                    .findFirst()
                    .map(GrantedAuthority::getAuthority)
                    .orElse("ROLE_CUSTOMER");

            systemLogService.log("Đăng nhập hệ thống thành công", userDetails.getUsername(), role, "SUCCESS");

            return ResponseEntity.ok(new JwtResponseDto(jwt,
                     userDetails.getId(),
                     userDetails.getUsername(),
                     role));
        } catch (org.springframework.security.authentication.DisabledException e) {
            systemLogService.log("Đăng nhập thất bại: Tài khoản bị ngưng hoạt động", loginRequest.getEmail(), "UNKNOWN", "WARNING");
            return ResponseEntity.badRequest().body(new MessageResponse("Tài khoản của bạn đã bị ngưng hoạt động!"));
        } catch (org.springframework.security.authentication.LockedException e) {
            systemLogService.log("Đăng nhập thất bại: Tài khoản bị khóa", loginRequest.getEmail(), "UNKNOWN", "WARNING");
            return ResponseEntity.badRequest().body(new MessageResponse("Tài khoản của bạn đã bị khóa!"));
        } catch (org.springframework.security.core.AuthenticationException e) {
            systemLogService.log("Đăng nhập thất bại: Sai email hoặc mật khẩu", loginRequest.getEmail(), "UNKNOWN", "DANGER");
            return ResponseEntity.status(401).body(new MessageResponse("Email hoặc mật khẩu không chính xác!"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequestDto signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Email này đã được sử dụng!"));
        }

        // Clean up any existing OTP token for this email (in case they request registration again)
        emailOtpTokenRepository.findByEmail(signUpRequest.getEmail())
                .ifPresent(t -> emailOtpTokenRepository.delete(t));

        // Generate 6-digit OTP
        String otp = String.format("%06d", new java.util.Random().nextInt(1000000));
        
        EmailOtpToken otpToken = new EmailOtpToken();
        otpToken.setEmail(signUpRequest.getEmail());
        otpToken.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        otpToken.setOtp(otp);
        otpToken.setExpiryDate(java.time.LocalDateTime.now().plusMinutes(5)); // OTP valid for 5 mins
        emailOtpTokenRepository.save(otpToken);

        // Send OTP email
        emailService.sendVerificationOtpEmail(signUpRequest.getEmail(), otp);

        systemLogService.log("Yêu cầu đăng ký tài khoản khách hàng mới: " + signUpRequest.getEmail(), signUpRequest.getEmail(), "ROLE_CUSTOMER", "SUCCESS");

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("message", "Đăng ký tài khoản thành công! Vui lòng kiểm tra email để lấy mã xác thực OTP kích hoạt tài khoản.");
        response.put("requiresVerification", true);
        response.put("email", signUpRequest.getEmail());

        return ResponseEntity.ok(response);
    }

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private EmailOtpTokenRepository emailOtpTokenRepository;

    @Autowired
    private EmailService emailService;

    @PostMapping("/verify-registration")
    public ResponseEntity<?> verifyRegistration(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email không được để trống!"));
        }

        if (otp == null || otp.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Mã OTP không được để trống!"));
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Tài khoản của bạn đã được xác thực hoạt động trước đó."));
        }

        EmailOtpToken otpToken = emailOtpTokenRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã OTP cho tài khoản này!"));

        if (otpToken.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
            emailOtpTokenRepository.delete(otpToken);
            return ResponseEntity.badRequest().body(new MessageResponse("Mã OTP đã hết hạn! Vui lòng bấm gửi lại mã OTP mới."));
        }

        if (!otpToken.getOtp().equals(otp.trim())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Mã OTP xác thực không chính xác!"));
        }

        // Create new user's account officially
        User user = new User();
        user.setEmail(otpToken.getEmail());
        user.setPassword(otpToken.getPassword());
        user.setStatus("ACTIVE");

        // Default role is ROLE_CUSTOMER
        Role userRole = roleRepository.findByName(ERole.ROLE_CUSTOMER)
                .orElseThrow(() -> new RuntimeException("Vai trò ROLE_CUSTOMER không tồn tại trên hệ thống."));
        user.setRole(userRole);

        userRepository.save(user);

        // Auto-create a default customer profile for the registered user
        Customer customer = new Customer();
        customer.setCustomerCode("CUS-" + (System.currentTimeMillis() % 1000000));
        customer.setFullName("Khách Hàng Mới");
        customer.setUser(user);
        customerRepository.save(customer);

        // Clean up OTP token
        emailOtpTokenRepository.delete(otpToken);

        systemLogService.log("Xác thực đăng ký tài khoản thành công", user.getEmail(), "ROLE_CUSTOMER", "SUCCESS");

        return ResponseEntity.ok(new MessageResponse("Xác thực tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ."));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Email không được để trống!"));
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.ok(new MessageResponse("Tài khoản của bạn đã được xác thực hoạt động trước đó."));
        }

        // Find existing OTP token to update it or delete and create a new one
        EmailOtpToken otpToken = emailOtpTokenRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy phiên đăng ký cho email này!"));

        // Generate new OTP
        String otp = String.format("%06d", new java.util.Random().nextInt(1000000));
        otpToken.setOtp(otp);
        otpToken.setExpiryDate(java.time.LocalDateTime.now().plusMinutes(5));
        emailOtpTokenRepository.save(otpToken);

        // Send OTP email
        emailService.sendVerificationOtpEmail(email, otp);

        systemLogService.log("Yêu cầu gửi lại mã OTP đăng ký mới", email, "ROLE_CUSTOMER", "SUCCESS");

        return ResponseEntity.ok(new MessageResponse("Đã gửi lại mã OTP xác thực mới thành công!"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email không được trống!"));
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.ok(new MessageResponse("Nếu email tồn tại trên hệ thống, mã xác thực đặt lại mật khẩu đã được gửi!"));
        }

        // Delete existing token if any
        passwordResetTokenRepository.findByUserId(user.getId())
                .ifPresent(t -> passwordResetTokenRepository.delete(t));

        // Create new token (6-digit OTP code)
        String token = String.format("%06d", new java.util.Random().nextInt(1000000));
        com.insurance.entity.PasswordResetToken resetToken = new com.insurance.entity.PasswordResetToken();
        resetToken.setUser(user);
        resetToken.setToken(token);
        resetToken.setExpiryDate(java.time.LocalDateTime.now().plusMinutes(15));
        
        passwordResetTokenRepository.save(resetToken);

        // Send email
        String resetLink = "http://localhost:5173/forgot-password?token=" + token;
        emailService.sendPasswordResetEmail(user.getEmail(), token, resetLink);

        systemLogService.log("Yêu cầu đặt lại mật khẩu thành công cho email: " + email, email, user.getRole().getName().toString(), "SUCCESS");

        return ResponseEntity.ok(new MessageResponse("Mã OTP đặt lại mật khẩu đã được gửi về email thành công!"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody java.util.Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        if (token == null || token.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Mã xác thực hoặc token đặt lại mật khẩu không hợp lệ!"));
        }

        if (newPassword == null || newPassword.trim().length() < 6) {
            return ResponseEntity.badRequest().body(new MessageResponse("Mật khẩu mới phải có tối thiểu 6 ký tự!"));
        }

        com.insurance.entity.PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElse(null);

        if (resetToken == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Mã xác thực OTP không hợp lệ hoặc đã hết hạn!"));
        }

        if (resetToken.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            return ResponseEntity.badRequest().body(new MessageResponse("Mã xác thực OTP đặt lại mật khẩu đã hết hạn!"));
        }

        User user = resetToken.getUser();
        
        // Kiểm tra xem mật khẩu mới có trùng với mật khẩu hiện tại hay không
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Bạn nên đổi lại mật khẩu khác so với mật khẩu bạn đã từng nhập ở đây"));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Delete token
        passwordResetTokenRepository.delete(resetToken);

        systemLogService.log("Đặt lại mật khẩu thành công bằng token/OTP", user.getEmail(), user.getRole().getName().toString(), "SUCCESS");

        return ResponseEntity.ok(new MessageResponse("Đặt lại mật khẩu thành công!"));
    }

    @PostMapping("/oauth2/callback/google")
    public ResponseEntity<?> googleCallback(@RequestBody java.util.Map<String, String> request) {
        String code = request.get("code");
        if (code == null || code.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Không tìm thấy mã code xác thực Google!"));
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            
            // 1. Exchange code for Google Access Token
            String tokenUrl = "https://oauth2.googleapis.com/token";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("code", code);
            params.add("client_id", googleClientId);
            params.add("client_secret", googleClientSecret);
            params.add("redirect_uri", googleRedirectUri);
            params.add("grant_type", "authorization_code");

            HttpEntity<MultiValueMap<String, String>> tokenRequest = new HttpEntity<>(params, headers);
            
            @SuppressWarnings("rawtypes")
            ResponseEntity<java.util.Map> tokenResponse = restTemplate.postForEntity(tokenUrl, tokenRequest, java.util.Map.class);
            
            if (!tokenResponse.getStatusCode().is2xxSuccessful() || tokenResponse.getBody() == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Không thể lấy token từ Google!"));
            }

            String accessToken = (String) tokenResponse.getBody().get("access_token");

            // 2. Get User Info from Google
            String userInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";
            HttpHeaders userInfoHeaders = new HttpHeaders();
            userInfoHeaders.setBearerAuth(accessToken);
            HttpEntity<Void> userInfoRequest = new HttpEntity<>(userInfoHeaders);

            @SuppressWarnings("rawtypes")
            ResponseEntity<java.util.Map> userInfoResponse = restTemplate.exchange(
                    userInfoUrl, HttpMethod.GET, userInfoRequest, java.util.Map.class);

            if (!userInfoResponse.getStatusCode().is2xxSuccessful() || userInfoResponse.getBody() == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Không thể lấy thông tin người dùng từ Google!"));
            }

            java.util.Map<?, ?> googleUser = userInfoResponse.getBody();
            String email = (String) googleUser.get("email");
            String name = (String) googleUser.get("name");

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Không thể lấy Email từ tài khoản Google của bạn!"));
            }

            return handleSocialLogin(email, name, "Google");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Lỗi xác thực Google: " + e.getMessage()));
        }
    }

    @PostMapping("/oauth2/callback/facebook")
    public ResponseEntity<?> facebookCallback(@RequestBody java.util.Map<String, String> request) {
        String code = request.get("code");
        if (code == null || code.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Không tìm thấy mã code xác thực Facebook!"));
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            
            // 1. Exchange code for Facebook Access Token
            String tokenUrl = String.format(
                "https://graph.facebook.com/v12.0/oauth/access_token?client_id=%s&redirect_uri=%s&client_secret=%s&code=%s",
                facebookClientId, facebookRedirectUri, facebookClientSecret, code
            );

            @SuppressWarnings("rawtypes")
            ResponseEntity<java.util.Map> tokenResponse = restTemplate.getForEntity(tokenUrl, java.util.Map.class);
            
            if (!tokenResponse.getStatusCode().is2xxSuccessful() || tokenResponse.getBody() == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Không thể lấy token từ Facebook!"));
            }

            String accessToken = (String) tokenResponse.getBody().get("access_token");

            // 2. Get User Info from Facebook Graph API
            String userInfoUrl = String.format(
                "https://graph.facebook.com/me?fields=id,name,email&access_token=%s",
                accessToken
            );

            @SuppressWarnings("rawtypes")
            ResponseEntity<java.util.Map> userInfoResponse = restTemplate.getForEntity(userInfoUrl, java.util.Map.class);

            if (!userInfoResponse.getStatusCode().is2xxSuccessful() || userInfoResponse.getBody() == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Không thể lấy thông tin người dùng từ Facebook!"));
            }

            java.util.Map<?, ?> facebookUser = userInfoResponse.getBody();
            String email = (String) facebookUser.get("email");
            String name = (String) facebookUser.get("name");

            if (email == null || email.trim().isEmpty()) {
                String id = (String) facebookUser.get("id");
                if (id != null) {
                    email = id + "@facebook.com";
                } else {
                    return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Tài khoản Facebook của bạn không công khai Email!"));
                }
            }

            return handleSocialLogin(email, name, "Facebook");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Lỗi xác thực Facebook: " + e.getMessage()));
        }
    }

    private ResponseEntity<?> handleSocialLogin(String email, String name, String provider) {
        java.util.Optional<User> userOptional = userRepository.findByEmail(email);
        User user;

        if (userOptional.isPresent()) {
            user = userOptional.get();
            if ("INACTIVE".equalsIgnoreCase(user.getStatus())) {
                systemLogService.log("Đăng nhập " + provider + " thất bại: Tài khoản bị ngưng hoạt động", email, "UNKNOWN", "WARNING");
                return ResponseEntity.badRequest().body(new MessageResponse("Tài khoản của bạn đã bị ngưng hoạt động!"));
            }
        } else {
            user = new User();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
            user.setStatus("ACTIVE");

            Role userRole = roleRepository.findByName(ERole.ROLE_CUSTOMER)
                    .orElseThrow(() -> new RuntimeException("Vai trò ROLE_CUSTOMER không tồn tại trên hệ thống."));
            user.setRole(userRole);
            user = userRepository.save(user);

            Customer customer = new Customer();
            customer.setCustomerCode("CUS-" + (System.currentTimeMillis() % 1000000));
            customer.setFullName(name != null && !name.trim().isEmpty() ? name : "Khách Hàng Mới (" + provider + ")");
            customer.setUser(user);
            customerRepository.save(customer);

            systemLogService.log("Đăng ký tài khoản mới qua " + provider + ": " + email, email, "ROLE_CUSTOMER", "SUCCESS");
        }

        UserDetailsImpl userDetails = UserDetailsImpl.build(user);

        UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtTokenProvider.generateJwtToken(authentication);

        String role = user.getRole().getName().toString();
        systemLogService.log("Đăng nhập hệ thống thành công qua " + provider, email, role, "SUCCESS");

        return ResponseEntity.ok(new JwtResponseDto(jwt,
                 user.getId(),
                 user.getEmail(),
                 role));
    }
}
