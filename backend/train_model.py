import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
import joblib

# Dataset load karna
df = pd.read_csv("Phishing_Email.csv.")

# Missing values hatana
df = df.dropna(subset=["Email Text", "Email Type"])

X = df["Email Text"]
y = df["Email Type"]

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Text ko numbers mein convert karna (TF-IDF)
vectorizer = TfidfVectorizer(max_features=5000, stop_words="english")
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

# Model train karna
model = LogisticRegression(max_iter=1000)
model.fit(X_train_vec, y_train)

# Test karna
predictions = model.predict(X_test_vec)
print("Accuracy:", accuracy_score(y_test, predictions))
print("\nDetailed Report:\n", classification_report(y_test, predictions))

# Model aur vectorizer save karna (baad mein backend mein use karenge)
joblib.dump(model, "phishing_model.pkl")
joblib.dump(vectorizer, "vectorizer.pkl")
print("\nModel saved successfully!")