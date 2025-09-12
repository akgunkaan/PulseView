from typing import Any, Tuple
import torch


class ChangeAnalyzer:
    def __init__(self):
        """
        İki görüntü özelliği arasındaki farkı analiz eden sınıf.
        """
        pass

    def get_key_change_features(self, features_pre: torch.Tensor, features_post: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        İki özellik tensörü arasındaki farkı hesaplayarak anahtar değişim özelliklerini
        ve bir değişim maskesi üretir.
        """
        # Anahtar değişim özellikleri: İki tensör arasındaki mutlak fark.
        key_change_features = torch.abs(features_post - features_pre)

        # Değişim maskesi: Farkın ortalamasını alıp bir eşik değeri ile ikili maske oluştur.
        # Bu, değişimin en yoğun olduğu yerleri kabaca gösterir.
        change_map = torch.mean(key_change_features, dim=-1).squeeze(0)
        change_mask = (change_map > change_map.mean()).float()
        return key_change_features, change_mask