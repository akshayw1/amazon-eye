# Amazon Hackathon: Advanced Trust & Fraud Detection System

## 🏆 Project Overview

This project was developed for the Amazon India Hackathon with the theme "Advanced Trust Increase by Fraud Detection". The system implements a comprehensive multi-modal approach to detect fraudulent activities, counterfeit products, and maintain product lifecycle integrity on e-commerce platforms.

## 🎯 Problem Statement

E-commerce platforms face multiple trust challenges:
- **Review Fraud**: Fake reviews manipulating product ratings
- **AI-Generated Content**: Automated spam reviews
- **Counterfeit Products**: Misleading product images and descriptions
- **Deceptive Listings**: Mismatched product images and descriptions
- **Product Identity Fraud**: Subtle visual manipulations

## 🚀 Solution Architecture

Our system employs 6 distinct AI-powered features working in tandem to create a robust trust framework:

### 🔹 Feature 1: Fake Product Detection via Review Behavior & Network Patterns

**Objective**: Detect products involved in fake review campaigns using graph-based network analysis.

**Methodology**:
- Engineered review-based features (avg rating, review gaps, 1-star/5-star ratio, helpful votes)
- Constructed bipartite reviewer-product graphs and projected to product-product similarity networks
- Calculated network centrality measures: PageRank, eigenvector centrality, clustering coefficient
- Trained RandomForestClassifier on 3,400 labeled Amazon products
- Applied K-Means clustering (k=20) on 64K unlabeled UCSD products for fraud-prone segment identification

**Key Innovation**: Detects review fraud without relying on textual or visual content analysis.

**Files**:
- `src/NetworkFeatures/feature_extraction.py` - Bipartite graph construction and metrics
- `src/NetworkFeatures/clustering_pipeline.py` - Clustering and prediction pipeline
- `src/NetworkFeatures/classifiers.py` - RandomForest training and evaluation
- `src/NetworkFeatures/run_pipeline.py` - Complete pipeline execution

![Network Analysis Results](ClusterNetworkAnalysis.png)

### 🔹 Feature 2: AI-Written Review Detection using RoBERTa

**Objective**: Identify AI-generated reviews to combat automated spam and fabricated feedback.

**Methodology**:
- Fine-tuned `roberta-base` model using HuggingFace Trainer
- Binary classification: AI-generated (1) vs Human-written (0)
- Deployed as REST API for real-time inference

**Impact**: Provides new trust signal based on AI-generated content percentage.

**Files**:
- `src/ReviewFeatures/train.py` - RoBERTa fine-tuning pipeline
- `src/ReviewFeatures/app.py` - Flask API endpoint `/check_ai_review`

### 🔹 Feature 3: Image-Description Matching using CLIP

**Objective**: Verify alignment between product images and textual descriptions.

**Methodology**:
- Utilized `openai/clip-vit-base-patch32` model
- Encoded images with CLIP vision encoder
- Encoded combined text (title + description) with CLIP text encoder
- Calculated cosine similarity between embeddings
- Flagged products below similarity threshold

**Use Case**: Detects deceptive listings with misleading product images.

**Files**:
- `src/ImageDescriptionMatching/train.py` - Image-text embedding generation
- `src/ImageDescriptionMatching/app.py` - Similarity check API endpoint
- `src/ImageDescriptionMatching/dataloader.py` - Dataset loading utilities

![CLIP Image-Description Matching Example](ClipImageDescriptionExample.png)

![CLIP Loss During Training](ClipLoss.png)

### 🔹 Feature 4: Image-Image Matching (Seller vs Reference)

**Objective**: Compare seller-uploaded images against verified reference images.

**Methodology**:
- Created labeled dataset of positive/negative image pairs
- Used CLIP vision encoder for embedding extraction
- Trained 2-layer fully connected classifier on similarity scores
- Binary prediction: Match (1) vs Mismatch (0)

**Application**: Identifies counterfeit listings with doctored or incorrect product photos.

**Files**:
- `src/ImageImageMatching/train.py` - Pairwise training implementation
- `src/ImageImageMatching/app.py` - Image matching API endpoint
- `src/ImageImageMatching/dataloader.py` - Image pair dataset loader

### 🔹 Feature 5: Visual Identity Learning with Barlow Twins

**Objective**: Self-supervised learning of product visual identity for counterfeit detection.

**Methodology**:
- ResNet18 backbone with MLP projection head
- Barlow Twins loss function for representation learning
- Enforced similarity between augmentations while maintaining disentanglement
- Cosine distance comparison for identity drift detection

**Advantage**: Operates without labeled counterfeit data using embedding-based anomaly detection.

**Files**:
- `AnalysisNotebooks/BarlowTwins(1).ipynb` - Barlow Twins implementation
- Self-supervised training pipeline

![Barlow Twins Loss Convergence](BarlowTwinsLoss.png)

### 🔹 Feature 6: Product Anomaly Detection via ViT-MAE

**Objective**: Transformer-based masked autoencoding for structural anomaly detection.

**Methodology**:
- Fine-tuned `facebook/vit-mae-base` model
- Trained to reconstruct masked patches from genuine product images
- Anomaly detection through reconstruction loss analysis
- Identifies poor reconstructions indicating counterfeit/tampered products

**Capability**: Detects subtle packaging forgeries and design inconsistencies.

**Files**:
- `AnalysisNotebooks/ViT_MaE.ipynb` - Vision Transformer MAE implementation

![ViT-MAE Masking Strategy](Vit-Mae-Masking.png)

![ViT-MAE Loss During Training](VitMaeLoss.png)

## 📊 Additional Analysis Components

### Trust Agent
- `trust_agent/app.py` - Trust scoring aggregation service
- `trust_agent/expected_response.json` - Response format specifications

### Trust Score API
- `trust_score/app.py` - Trust score calculation service
- `trust_score/test_api.py` - API testing suite
- `trust_score/mock_server.py` - Development testing server

## 🛠️ Technical Stack

- **Deep Learning**: PyTorch, HuggingFace Transformers
- **Computer Vision**: CLIP, Vision Transformer (ViT), ResNet
- **NLP**: RoBERTa, Transformer models
- **Graph Analysis**: NetworkX, custom graph algorithms
- **Machine Learning**: Scikit-learn, RandomForest, K-Means
- **API Framework**: Flask
- **Data Processing**: Pandas, NumPy

## 📈 Key Innovations

1. **Multi-Modal Approach**: Combines text, image, and network analysis
2. **Graph-Based Fraud Detection**: Novel application of network centrality for review fraud
3. **Self-Supervised Learning**: Reduces dependency on labeled counterfeit data
4. **Real-Time API Integration**: Production-ready endpoints for live deployment
5. **Comprehensive Trust Framework**: End-to-end solution covering multiple fraud vectors

## 🎯 Impact & Applications

- **E-commerce Platforms**: Enhanced product authenticity verification
- **Marketplace Trust**: Improved buyer confidence through multi-layered validation
- **Fraud Prevention**: Proactive detection of sophisticated fraud schemes
- **Product Lifecycle Management**: Continuous monitoring of product integrity

## 🚀 Future Enhancements

- Integration with blockchain for immutable trust records
- Real-time graph updates for dynamic fraud detection
- Advanced ensemble methods combining all features
- Mobile app integration for consumer-facing trust scores

## 📞 Contact

This project demonstrates cutting-edge AI applications in e-commerce trust and fraud detection, showcasing the potential for comprehensive marketplace integrity solutions.

---

*Developed for Amazon India Hackathon - Advanced Trust & Fraud Detection Theme*
