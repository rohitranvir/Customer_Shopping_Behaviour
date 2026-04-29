import numpy as np
import pickle
import streamlit as st
loded_model=pickle.load(open("Trained_model.sav",'rb'))
from sklearn.preprocessing import StandardScaler
scaler=StandardScaler()
# Creating a function for Prediction
def diabetic_prediction(input_data):
    # Changing the input data to Numpy array
    from sklearn.preprocessing import StandardScaler
    scaler=StandardScaler()
    input_data_as_numpy_array=np.asarray(input_data)
    input_data_reshaped=input_data_as_numpy_array.reshape(1,-1)
    input_data_reshaped = scaler.transform(input_data_reshaped)
    prediction=loded_model.predict(input_data_reshaped)
    print(prediction)
    if (prediction[0]==0):
        return "The person has no dibeties"
    else:
        return "The person has dibeties"
    
def main():
    # GIving a title
    st.title("Dibetes Prediction Web app")

    # Getting the input data 

    Pregnancies=st.text_input("Number of Pregnancies")
    Glucose=st.text_input("Number of Glucose")
    BloodPressure=st.text_input("Number of BloodPressure")
    SkinThickness=st.text_input("Number of SkinThickness")
    Insulin=st.text_input("Number of Insulin")
    BMI=st.text_input("Number of BMI")
    DiabetesPedigreeFunction=st.text_input("Number of DiabetesPedigreeFunction")
    Age=st.text_input("Number of Age")


    # Code for prediction
    diagnosis= ''
    # Creating a button for prediction
    if st.button("Dibetes Test Result"):
        diagnosis=diabetic_prediction([Pregnancies,Glucose,BloodPressure,SkinThickness,Insulin,BMI,DiabetesPedigreeFunction,Age])
    st.success(diagnosis)
if __name__ == '__main__':
    main()
