package com.aibus.controller;

import com.aibus.service.gds.GdsApiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Controller for B2B Travel Agent Network, KYC Enquiries, and Admin Approvals.
 */
@RestController
@RequestMapping("/api/agents")
public class AgentController {

    private final GdsApiService gdsApiService;

    // In-memory thread-safe storage for Agent enquiries and approved partners
    private final Map<String, Map<String, Object>> enquiriesStore = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> agentsStore = new ConcurrentHashMap<>();

    public AgentController(GdsApiService gdsApiService) {
        this.gdsApiService = gdsApiService;
    }

    /**
     * Submit agent KYC registration enquiry
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerEnquiry(@RequestBody Map<String, Object> payload) {
        String newId = "ENQ-2026-" + (1000 + new Random().nextInt(9000));
        payload.put("id", newId);
        payload.put("status", "PENDING");
        payload.put("appliedDate", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

        enquiriesStore.put(newId, payload); 

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Application submitted successfully for admin KYC review.");
        response.put("data", payload);
        return ResponseEntity.ok(response);
    }

    // The password stays on the server
    private Map<String, Object> withoutPassword(Map<String, Object> agent) {
        Map<String, Object> copy = new HashMap<>(agent);
        copy.remove("password");
        return copy;
    }

    /**
     * Agent Login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> creds) {
        String identifier = creds.getOrDefault("identifier", "").trim();
        String password = creds.getOrDefault("password", "").trim();

        // Check approved agents
        for (Map<String, Object> agent : agentsStore.values()) {
            if ((identifier.equalsIgnoreCase((String) agent.get("agentCode")) ||
                 identifier.equalsIgnoreCase((String) agent.get("mobile")) ||
                 identifier.equalsIgnoreCase((String) agent.get("email"))) &&
                password.equals(agent.get("password"))) {
                
                Map<String, Object> res = new HashMap<>();
                res.put("success", true);
                res.put("data", withoutPassword(agent));
                return ResponseEntity.ok(res);
            }
        }

        // Check if pending enquiry
        for (Map<String, Object> enq : enquiriesStore.values()) {
            if (identifier.equalsIgnoreCase((String) enq.get("id")) ||
                identifier.equalsIgnoreCase((String) enq.get("mobile"))) {
                Map<String, Object> res = new HashMap<>();
                res.put("success", false);
                res.put("isPending", true);
                res.put("message", "Application #" + enq.get("id") + " is currently under review by AIBus Compliance Desk.");
                return ResponseEntity.ok(res);
            }
        }

        Map<String, Object> err = new HashMap<>();
        err.put("success", false);
        err.put("message", "Invalid Agent Code, Mobile Number, or Password.");
        return ResponseEntity.status(401).body(err);
    }

    /**
     * Admin: Get all agent enquiries
     */
    @GetMapping("/enquiries")
    public ResponseEntity<?> getEnquiries() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", new ArrayList<>(enquiriesStore.values()));
        return ResponseEntity.ok(response);
    }

    /**
     * Admin: Approve agent enquiry
     */
    @PostMapping("/enquiries/{id}/approve")
    public ResponseEntity<?> approveEnquiry(@PathVariable String id, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> enq = enquiriesStore.get(id);
        if (enq == null) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "Enquiry not found"));
        }

        enq.put("status", "APPROVED");
        enq.put("approvedAt", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));

        double comm = body != null && body.containsKey("commissionPct") ? Double.parseDouble(body.get("commissionPct").toString()) : 10.0;
        double balance = body != null && body.containsKey("initialBalance") ? Double.parseDouble(body.get("initialBalance").toString()) : 19978.55;

        String agentCode = "AG-" + (5000 + new Random().nextInt(4999));
        Map<String, Object> newAgent = new HashMap<>(enq);
        newAgent.put("agentCode", agentCode);
        newAgent.put("commissionPct", comm);
        newAgent.put("walletBalance", balance);
        newAgent.put("password", "agent" + enq.getOrDefault("mobile", "1234").toString().substring(6));

        agentsStore.put(agentCode, newAgent);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Agent approved and code generated: " + agentCode);
        response.put("data", newAgent);
        return ResponseEntity.ok(response);
    }

    /**
     * Admin: Reject agent enquiry
     */
    @PostMapping("/enquiries/{id}/reject")
    public ResponseEntity<?> rejectEnquiry(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        Map<String, Object> enq = enquiriesStore.get(id);
        if (enq == null) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "Enquiry not found"));
        }

        String reason = body != null ? body.getOrDefault("reason", "Verification criteria not met") : "Verification criteria not met";
        enq.put("status", "REJECTED");
        enq.put("rejectionReason", reason);

        return ResponseEntity.ok(Map.of("success", true, "message", "Application rejected with remarks", "data", enq));
    }

    /**
     * Admin: Get all approved agents
     */
    @GetMapping("/approved")
    public ResponseEntity<?> getApprovedAgents() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", new ArrayList<>(agentsStore.values()));
        return ResponseEntity.ok(response);
    }

    /**
     * Get live Mantis wallet balance for agent
     */
    @GetMapping("/balance")
    public ResponseEntity<?> getAgentBalance() {
        return ResponseEntity.ok(gdsApiService.getAgentBalance());
    }
}
