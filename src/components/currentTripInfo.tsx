import {
  IonContent,
  IonHeader,
  IonLabel,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import React from "react";
interface CurrentTripInfoProps {
  routeInfo: any;
  stopInfo: any;
}

const CurrentTripInfo: React.FC<CurrentTripInfoProps> = ({
  routeInfo,
  stopInfo,
}) => {
  console.log("route info tab", routeInfo);
  console.log("stops info tab", stopInfo);
  return (
    <>
      <IonToolbar>
        <IonSegment value="all">
          <IonSegmentButton value="route">
            <IonLabel>Route</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="stops">
            <IonLabel>Stops</IonLabel>
          </IonSegmentButton>
        </IonSegment>
      </IonToolbar>

      <IonText> Route</IonText>
      {routeInfo?.map((routes: any) => {
        return <div>{routes}</div>;
      })}
      <IonText> stops</IonText>
      {stopInfo?.map((stop: any) => {
        return (
          <>
            <div>{stop.stopName}</div>
            <div>{stop.lat}</div>
            <div>{stop.lng}</div>
          </>
        );
      })}
    </>
  );
};

export default CurrentTripInfo;
