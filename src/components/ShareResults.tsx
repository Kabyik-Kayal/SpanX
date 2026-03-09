import { useState, useRef } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Share2, Download, Copy, Check, Twitter, Linkedin } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface ShareResultsProps {
  screenshotRef: React.RefObject<HTMLDivElement>;
  overallScore: number | null;
}

const ShareResults = ({ screenshotRef, overallScore }: ShareResultsProps) => {
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const shareUrl = "https://www.kabyik.dev/SpanX/";
  const shareText = overallScore !== null
    ? `I scored in the ${overallScore}th percentile on the SpanX Attention Test! Can you beat my score?`
    : "Check out the SpanX Attention Test!";

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    setCopied(true);
    toast("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = async () => {
    if (!screenshotRef.current) return;
    setGenerating(true);
    try {
      const dataUrl = await toPng(screenshotRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = "attentra-results.png";
      link.href = dataUrl;
      link.click();
      toast("Image downloaded!");
    } catch {
      toast("Failed to generate image");
    } finally {
      setGenerating(false);
    }
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank");
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share2 className="h-3.5 w-3.5" />
          Share Results
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Share Your Results</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <Button variant="outline" className="justify-start gap-3" onClick={handleDownloadImage} disabled={generating}>
            <Download className="h-4 w-4" />
            {generating ? "Generating…" : "Download as Image"}
          </Button>
          <Button variant="outline" className="justify-start gap-3" onClick={handleCopyLink}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy Link & Text"}
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 gap-2" onClick={handleShareTwitter}>
              <Twitter className="h-4 w-4" />
              Twitter / X
            </Button>
            <Button variant="outline" className="flex-1 gap-2" onClick={handleShareLinkedIn}>
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareResults;
