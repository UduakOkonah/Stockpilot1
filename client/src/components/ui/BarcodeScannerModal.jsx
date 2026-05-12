import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

function BarcodeScannerModal({ isOpen, onClose, onScan }) {
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const scanner = new Html5QrcodeScanner(
      "barcode-reader",
      {
        fps: 10,
        qrbox: {
          width: 250,
          height: 120,
        },
      },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      async (decodedText) => {
        onScan(decodedText);

        try {
          await scanner.clear();
        } catch {
          console.log("Scanner already cleared");
        }

        scannerRef.current = null;
        onClose();
      },
      () => {}
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .catch(() => console.log("Scanner already cleared"));

        scannerRef.current = null;
      }
    };
  }, [isOpen, onClose, onScan]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">
              Scan Barcode
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Point your camera at the barcode.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="bg-slate-50 p-4 dark:bg-slate-950">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black p-3 dark:border-slate-800">
            <div id="barcode-reader" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BarcodeScannerModal;