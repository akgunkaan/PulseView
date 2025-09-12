from typing import Any
import torch
from transformers import CLIPVisionModel, CLIPImageProcessor
from PIL import Image


class VisionEncoder:
    def __init__(self, model_name: str = "openai/clip-vit-large-patch14"):
        """
        Görüntülerden özellikleri çıkaran Vision Transformer (ViT) tabanlı sınıf.
        Hugging Face'den gerçek bir model yükler.
        """
        self.model_name = model_name
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"VisionEncoder, '{self.device}' üzerinde çalışıyor.")

        self.model = CLIPVisionModel.from_pretrained(model_name).to(self.device)
        self.processor = CLIPImageProcessor.from_pretrained(model_name)

    def extract_features(self, image: Image.Image) -> torch.Tensor:
        """
        Verilen bir PIL görüntüsünden anlamsal özellikleri çıkarır.
        """
        inputs = self.processor(images=image, return_tensors="pt").to(self.device)
        with torch.no_grad():
            outputs = self.model(**inputs)
        # We use the last hidden state as the feature representation
        return outputs.last_hidden_state