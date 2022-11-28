import toast from "react-hot-toast";

const style = {
  textAlign: "center",
  backgroundColor: "#fef5e6",
};

const notifySucess = (msg = "", position = "top-center") => {
  toast.success(msg, {
    position,
    style,
    iconTheme: {
      secondary: "#effee6",
    },
  });
};

const notifyPlayResult = (msg = "", won = true, position = "top-center") => {
  toast.success(`${msg} and ${won ? "won" : "lost"}!`, {
    position,
    icon: won ? "🥳" : "😔",
    style,
    iconTheme: {
      secondary: "#effee6",
    },
  });
};

const notifyError = (msg = "", position = "top-center") => {
  toast.error(msg, {
    position,
    style,
    iconTheme: {
      primary: "#c0352d",
    },
  });
};

export { notifySucess, notifyError, notifyPlayResult };
