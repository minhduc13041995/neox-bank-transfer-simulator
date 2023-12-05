import CloseIcon from '@mui/icons-material/Close';
import { Alert, Divider, Grid, Snackbar } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import IconButton from '@mui/material/IconButton';
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { QrScanner } from "@yudiel/react-qr-scanner";
import axios from "axios";
import { Fragment, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { decodeQr } from 'vn-qr-pay';

interface IVietQr {
  isValid: boolean;
  version: string;
  initMethod: string;
  provider: {
    fieldId: string;
    guid: string;
    name: string;
    service: string;
  };
  consumer: {
    bankBin: string;
    bankNumber: string;
  };
  category: string;
  currency: string;
  amount: string;
  tipAndFeeType: string;
  tipAndFeeAmount: string;
  tipAndFeePercent: string;
  nation: string;
  acquier: {
    name: string;
    id: string;
  };
  city: string;
  zipCode: string;
  additionalData: {
    billNumber: string;
    mobileNumber: string;
    store: string;
    loyaltyNumber: string;
    reference: string;
    customerLabel: string;
    terminal: string;
    dataRequest: string;
    purpose?: string;
  };
  crc: string;
}

const min = 1;
const max = 499000000;

const listSupportBanks = [{
	"swiftCode" : "MSCBVNVX",
	"bin" : "970422",
	"shortName" : "MB BANK",
	"bankCode" : "mbbank"
},
{
	"swiftCode" : "HVBKVNVX",
	"bin" : "970457",
	"shortName" : "Wooribank",
	"bankCode" : "wooribank"
},
{
	"swiftCode" : "VCBCVNVX",
	"bin" : "970454",
	"shortName" : "Viet Capital Bank",
	"bankCode" : "banvietbank"
},
{
	"swiftCode" : "ICBVVNVX",
	"bin" : "970415",
	"shortName" : "VietinBank",
	"bankCode" : "vietinbank"
}]

function Copyright(props: any) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {"Copyright © "}
      <Link color="inherit" href="https://neox.vn/" >
        NeoX By NeoPay
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}
const defaultTheme = createTheme();
export default function App() {
  const windowUrl = window.location.search;
  const params = new URLSearchParams(windowUrl);
  const [qrData, setQrData] = useState<IVietQr | null>();
  const [initTokenData, setInitTokenData] = useState<string | null>(params.get("accessToken"));
  const [tokenData, setTokenData] = useState<string | null>(initTokenData);
  const [qrErrorMessage, setQrErrorMessage] = useState<string | null>();
  const [tokenErrorMessage, setTokenErrorMessage] = useState<string | null>();
  const [isValidToken, setIsValidToken] = useState<boolean>(false);
  const [isValidQr, setIsValidQr] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(100000);
  const [open, setOpen] = useState(false);

  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    let data = JSON.stringify({
      token: tokenData,
      bankCode: listSupportBanks.find(item => item.bin === qrData?.consumer?.bankBin)?.bankCode,
      customerAccount: qrData?.consumer?.bankNumber,
      amount: amount,
      remark: qrData?.additionalData?.purpose
    });
    
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://sandbox-portal.neopay.vn/merchant/api/v1/merchant/simulation/request-bank-transfer',
      headers: { 
        'Content-Type': 'application/json'
      },
      data : data
    };
    axios.request(config)
    .then(() => {
      toast.success("Chuyển tiền thành công");
      setQrData(null);
      setIsValidQr(false);
    })
    .catch((error) => {
      toast.error(`Chuyển tiền thất bại. Lý do: ${error?.response?.data?.message || error.message}`);
    });
  };

  const handleQrChange = (data: string) => {
    console.log(data)
    const decodeData: IVietQr = decodeQr(data);
    if(decodeData.isValid) {
      setQrErrorMessage(null);
      setQrData(decodeData);
      setIsValidQr(true);
    }
    else{
      setQrErrorMessage("QR Code không hợp lệ");
      setIsValidQr(false);
    }
  }

  const handleQrError = (error: any) => {
    setQrErrorMessage(error.toString());
    setIsValidQr(false);
    setQrData(null);
  }

  const handleChangeToken = (event: any) => {
    const value = event.target.value;
    const tokentRegex = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
    if(tokentRegex.test(value)){
      setTokenErrorMessage(null);
      setTokenData(value);
      setIsValidToken(true);
    }
    else{
      setTokenErrorMessage("Token không hợp lệ")
      setIsValidToken(false);
    }
  }

  const action = (
    <Fragment>
      <Button color="secondary" size="small" onClick={handleClose}>
        UNDO
      </Button>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Fragment>
  );

  return (
    <ThemeProvider theme={defaultTheme}>
      <section>
        <div className="air air1"></div>
        <div className="air air2"></div>
        <div className="air air3"></div>
        <div className="air air4"></div>
      </section>
      <ToastContainer/>
      <Container component="main" maxWidth="xs">
      <CssBaseline />
        <Box
          sx={{
            marginTop: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          <Typography component="h1" variant="h5" sx={{ fontweight: 'bold' }}>
            Neopay Bank Transfer QR Simulator
          </Typography>
        </Box>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <Box sx={{ m: 2 }}>
            <QrScanner onDecode={(data) => handleQrChange(data)} onError={(error) => handleQrError(error)} />
          </Box>
          {qrData && (
            <>
              <Divider></Divider>
              <Grid container spacing={2} alignItems={"center"} sx={{ m: 2 }}>
                <Grid xs={5}>
                  <Typography >Ngân hàng: </Typography>
                </Grid>
                <Grid xs={7}>
                  <Typography variant="button" sx={{ fontweight: 'bold' }}>{listSupportBanks.find(item => item.bin === qrData.consumer.bankBin)?.shortName || "Không hỗ trợ"}</Typography>
                </Grid>
                <Grid xs={5}>
                  <Typography>Số tài khoản: </Typography>
                </Grid>
                <Grid xs={7}>
                  <Typography variant="button" sx={{ fontweight: 'bold' }}>{qrData.consumer.bankNumber}</Typography>
                </Grid>
                <Grid xs={5}>
                  <Typography>Tên tài khoản: </Typography>
                </Grid>
                <Grid xs={7}>
                  <Typography variant="button" sx={{ fontweight: 'bold' }}>{qrData.acquier.name}</Typography>
                </Grid>
                <Grid xs={5}>
                  <Typography>Nội dung chuyển: </Typography>
                </Grid>
                <Grid xs={7}>
                  <Typography variant="button" sx={{ fontweight: 'bold' }}>{qrData.additionalData.purpose}</Typography>
                </Grid>
              </Grid>
              <Divider></Divider>
            </>
          )}
          {qrErrorMessage && <Alert severity="error">{qrErrorMessage}</Alert>}
          {!initTokenData && <TextField 
            margin="normal" 
            required 
            fullWidth 
            id="token" 
            label="Access Token" 
            name="token" 
            autoFocus
            value={tokenData}
            error={!!tokenErrorMessage}
            helperText={tokenErrorMessage}
            onBlur={(event: any) => handleChangeToken(event)}
          />}
          <TextField
            label="Số tiền" 
            fullWidth
            type="number"
            inputProps={{ min, max }}
            defaultValue={100000}
            value={amount}
            onChange={(e) => {
              let value = parseInt(e.target.value, 10) || 0;
              if (value > max) value = max;
              if (value < min) value = min;
              setAmount(value);
            }}
            error={(amount > max || amount < min)}
            helperText={(amount > max || amount < min) ? "Số tiền không hợp lệ" : ""}
            variant="outlined"
            sx={{ mt: 2 }}
          />
          <Button disabled={!isValidQr} onClick={handleSubmit} fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Thanh toán
          </Button>
          <Snackbar
            open={open}
            autoHideDuration={6000}
            onClose={handleClose}
            message="Note archived"
            action={action}
          />
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
    </ThemeProvider>
  );
}
