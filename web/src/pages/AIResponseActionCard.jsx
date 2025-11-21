import React from "react";
import { Card, CardContent, Typography, Button, Box, Chip, Stack } from "@mui/material";

const AIResponseActionCard = ({
  aiData,            // <-- pass the whole JSON here
  action1Label,
  action2Label,
  onAction1,
  onAction2
}) => {
  if (!aiData) return null;

  const {
    decision,
    reason,
    polite_message,
    internal_notes,
    fraud_flag,
    fraud_risk_level
  } = aiData;

  return (
    <Card
      sx={{
        width: "100%",
        mt: 3,
        p: 2,
        bgcolor: "#f8f9fa",
        borderRadius: 2,
        border: "1px solid #e0e0e0",
      }}
    >
      <CardContent>

        <Typography variant="h6" fontWeight={600} gutterBottom>
          AI Review Summary
        </Typography>

        {/* AI Decision */}
        <Box mb={2}>
          <Typography variant="subtitle2" color="text.secondary">Decision</Typography>
          <Chip 
            label={decision}
            color={decision === "refund_approved" ? "success" : "warning"}
            sx={{ mt: 1 }}
          />
        </Box>

        {/* Reason */}
        <Box mb={2}>
          <Typography variant="subtitle2" color="text.secondary">Internal Reason</Typography>
          <Typography sx={{ mt: 0.5 }}>{reason}</Typography>
        </Box>

        {/* Polite Message */}
        <Box mb={2}>
          <Typography variant="subtitle2" color="text.secondary">Message for Customer</Typography>
          <Typography sx={{ mt: 0.5 }}>{polite_message}</Typography>
        </Box>

        {/* Fraud Details */}
        <Box mb={2}>
          <Typography variant="subtitle2" color="text.secondary">Fraud Check</Typography>
          <Stack direction="row" spacing={1} mt={1}>
            <Chip 
              label={fraud_flag ? "Fraud Suspected" : "No Fraud"} 
              color={fraud_flag ? "error" : "success"} 
            />
            <Chip 
              label={`Risk: ${fraud_risk_level}`}
              color={fraud_risk_level === "high" ? "error" : "info"}
            />
          </Stack>
        </Box>

        {/* Internal Notes */}
        {internal_notes && (
          <Box mb={2}>
            <Typography variant="subtitle2" color="text.secondary">Internal Notes</Typography>
            <Typography sx={{ mt: 0.5 }}>{internal_notes}</Typography>
          </Box>
        )}

        {/* Action Buttons */}
        <Box display="flex" gap={2} mt={3}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={onAction1}
            sx={{ textTransform: "none" }}
          >
            {action1Label}
          </Button>

          <Button 
            variant="outlined" 
            color="primary" 
            onClick={onAction2}
            sx={{ textTransform: "none" }}
          >
            {action2Label}
          </Button>
        </Box>

      </CardContent>
    </Card>
  );
};

export default AIResponseActionCard;
