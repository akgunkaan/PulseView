from typing import Any
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer


class CaptionDecoder:
    def __init__(self, model_name: str = "Qwen/Qwen2-1.5B-Instruct"):
        """
        Büyük Dil Modeli'ni (LLM) kullanarak değişim metni üreten sınıf.
        Hugging Face'den gerçek bir model yükler.
        """
        self.model_name = model_name
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"CaptionDecoder, '{self.device}' üzerinde çalışıyor.")

        self.model = AutoModelForCausalLM.from_pretrained(model_name).to(self.device)
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)

        # Görsel özellikleri dil modelinin anlayacağı boyuta getiren basit bir projektör
        self.visual_projector = torch.nn.Linear(1024, self.model.config.hidden_size).to(self.device)

    def generate_caption(self, change_features: torch.Tensor, instruction: str) -> str:
        """
        Verilen değişim özelliklerini ve talimatı kullanarak bir metin açıklaması üretir.
        """
        # Görsel özellikleri dil modelinin embedding uzayına projekte et
        projected_features = self.visual_projector(change_features.to(self.device))

        # Talimatı token'larına ayır
        messages = [
            {"role": "system", "content": "You are a helpful remote sensing image analysis assistant."},
            {"role": "user", "content": instruction}
        ]
        text = self.tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        inputs = self.tokenizer(text, return_tensors="pt").to(self.device)

        # Görsel özellikleri metin embedding'leri ile birleştir
        # Bu basit bir yaklaşımdır; gerçekte daha karmaşık bir hizalama gerekir.
        input_embeds = self.model.get_input_embeddings()(inputs.input_ids)
        combined_embeds = torch.cat([projected_features, input_embeds], dim=1)

        # Metin üret
        with torch.no_grad():
            outputs = self.model.generate(inputs_embeds=combined_embeds, max_new_tokens=50)

        # Üretilen token'ları metne çevir
        caption = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        # Sadece üretilen kısmı al
        response_part = caption[len(text)-len(self.tokenizer.decode(inputs.input_ids[0])):]
        return response_part.strip()