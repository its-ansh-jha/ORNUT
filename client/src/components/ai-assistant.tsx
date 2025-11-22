import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Image as ImageIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";

interface Message {
  role: "user" | "model";
  parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
  products?: any[];
}

export function AIAssistant({ onAddToCart }: { onAddToCart?: (productId: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [uploadedImage, setUploadedImage] = useState<{ mimeType: string; data: string } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const chatMutation = useMutation({
    mutationFn: async (data: { messages: Message[]; image?: { mimeType: string; data: string } }): Promise<{ response: string; products?: any[] }> => {
      return new Promise((resolve, reject) => {
        const response = fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        response.then((res) => {
          if (!res.ok) throw new Error("Failed to send message");
          if (!res.body) throw new Error("No response body");

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let fullText = "";
          let products: any[] = [];

          const processStream = async () => {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split("\n");

                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    const data = line.slice(6).trim();
                    if (data === "[DONE]") continue;
                    if (!data) continue;

                    try {
                      const parsed = JSON.parse(data);
                      if (parsed.chunk) {
                        if (typeof parsed.chunk === "string") {
                          if (parsed.chunk.startsWith('{"type":"products"')) {
                            const productData = JSON.parse(parsed.chunk);
                            products = productData.data;
                          } else {
                            fullText += parsed.chunk;
                            setMessages((prev) => {
                              const newMessages = [...prev];
                              if (newMessages[newMessages.length - 1]?.role === "model") {
                                newMessages[newMessages.length - 1] = {
                                  ...newMessages[newMessages.length - 1],
                                  parts: [{ text: fullText }],
                                };
                              }
                              return newMessages;
                            });
                          }
                        }
                      }
                    } catch (e) {
                      // Continue on parse error
                    }
                  }
                }
              }

              resolve({
                response: fullText,
                products: products.length > 0 ? products : undefined,
              });
            } catch (error) {
              reject(error);
            }
          };

          processStream();
        }).catch(reject);
      });
    },
    onSuccess: (data: { response: string; products?: any[] }) => {
      setMessages((prev) => [
        ...prev,
        { 
          role: "model", 
          parts: [{ text: data.response }],
          products: data.products 
        },
      ]);
      setUploadedImage(null);
      setImagePreview(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    if (!input.trim() && !uploadedImage) return;

    const userMessage: Message = {
      role: "user",
      parts: [],
    };

    if (input.trim()) {
      userMessage.parts.push({ text: input });
    }
    if (uploadedImage) {
      userMessage.parts.push({ inlineData: uploadedImage });
    }

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");

    chatMutation.mutate({
      messages: newMessages,
      image: uploadedImage || undefined,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const base64Data = base64.split(",")[1];
      setUploadedImage({
        mimeType: file.type,
        data: base64Data,
      });
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: "model",
          parts: [{ text: "Hello! I'm the Ornut Assistant. I can help you find the perfect peanut butter, answer questions about our products, or suggest how to use them in your recipes. You can also upload images of your meals and I'll suggest how Ornut can make them even better! How can I help you today?" }],
        },
      ]);
    }
  }, [isOpen]);

  const portalContent = (
    <div className="ai-assistant-container" style={{ 
      position: "fixed", 
      right: "24px", 
      zIndex: 99999, 
      width: "clamp(300px, 384px, calc(100vw - 48px))",
      pointerEvents: !isOpen ? "auto" : "auto",
      transform: "translateZ(0)",
      willChange: "transform"
    }}>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
          data-testid="button-open-chat"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <Card className="w-full h-[600px] shadow-xl flex flex-col overflow-hidden" style={{ maxHeight: "90vh" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <CardTitle className="text-lg font-semibold">Ornut Assistant</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              data-testid="button-close-chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
            <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {msg.parts.map((part, partIdx) => (
                        <div key={partIdx}>
                          {part.inlineData && (
                            <img
                              src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`}
                              alt="Uploaded"
                              className="max-w-full rounded mb-2"
                            />
                          )}
                          {part.text && (
                            <p className="text-sm whitespace-pre-wrap">{part.text}</p>
                          )}
                        </div>
                      ))}
                      {msg.products && msg.products.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {msg.products.map((product) => (
                            <div
                              key={product.id}
                              className="bg-card text-card-foreground rounded-md p-3 border"
                            >
                              <div className="flex items-start gap-3">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-16 h-16 object-cover rounded"
                                />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm truncate">
                                    {product.name}
                                  </h4>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    ₹{Number(product.price).toFixed(2)}
                                  </p>
                                  {product.inStock ? (
                                    <Badge variant="default" className="mt-1 text-xs">
                                      In Stock
                                    </Badge>
                                  ) : (
                                    <Badge variant="destructive" className="mt-1 text-xs">
                                      Out of Stock
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              {product.inStock && onAddToCart && (
                                <Button
                                  size="sm"
                                  className="w-full mt-2"
                                  onClick={() => {
                                    if (!user) {
                                      toast({
                                        title: "Please login first",
                                        description: "You need to sign in to add items to cart",
                                        variant: "destructive",
                                      });
                                      return;
                                    }
                                    onAddToCart(product.id);
                                  }}
                                  data-testid={`button-add-to-cart-${product.id}`}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add to Cart
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {chatMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="mt-4 space-y-2">
              {imagePreview && (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-[100px] max-h-[100px] rounded border"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={handleRemoveImage}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  data-testid="input-image-upload"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={chatMutation.isPending}
                  data-testid="button-upload-image"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask me anything..."
                  disabled={chatMutation.isPending}
                  data-testid="input-chat-message"
                />
                <Button
                  onClick={handleSend}
                  disabled={chatMutation.isPending || (!input.trim() && !uploadedImage)}
                  data-testid="button-send-message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return createPortal(portalContent, document.body);
}
