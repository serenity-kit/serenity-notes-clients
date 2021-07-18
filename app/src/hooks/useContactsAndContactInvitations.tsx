import React from "react";
import { Alert } from "react-native";
import { useClient } from "urql";
import contacts from "../graphql/contacts";
import contactInvitations from "../graphql/contactInvitations";
import useDevice from "./useDevice";
import useUser from "./useUser";
import usePrivateInfo from "./usePrivateInfo";
import fetchPrivateInfo from "../utils/server/fetchPrivateInfo";
import completeContactInvitation from "../utils/server/completeContactInvitation";
import * as privateInfoStore from "../stores/privateInfoStore";
import { createAuthenticationToken } from "../utils/device";
import useMyVerifiedDevices from "../hooks/useMyVerifiedDevices";

type State =
  | { type: "loading" }
  | { type: "error" }
  | { type: "result"; contactInvitations: any[]; contacts: any[] };

const useContactsAndContactInvitations = (navigation: any): State => {
  const client = useClient();
  const deviceResult = useDevice();
  const privateInfoResult = usePrivateInfo();
  const userResult = useUser();
  const fetchMyVerifiedDevices = useMyVerifiedDevices();
  const [state, setState] = React.useState<State>({ type: "loading" });

  const fetchContactInvitations = async () => {
    if (
      deviceResult.type !== "device" ||
      privateInfoResult.type !== "privateInfo" ||
      userResult.type !== "user"
    )
      return;

    try {
      await fetchPrivateInfo(client, deviceResult.device);
      const contactInvitationsResult = await client
        .query(
          contactInvitations,
          {},
          {
            fetchOptions: {
              headers: {
                authorization: `signed-utc-msg ${createAuthenticationToken(
                  deviceResult.device
                )}`,
              },
            },
          }
        )
        .toPromise();

      if (contactInvitationsResult?.data?.contactInvitations) {
        const acceptedContactInvitations =
          contactInvitationsResult.data.contactInvitations.filter(
            (invitation) => invitation.status === "ACCEPTED"
          );
        if (acceptedContactInvitations.length > 0) {
          // run in serial, because it's easier to manage in the code?!
          for (const contactInvitation of acceptedContactInvitations) {
            try {
              await completeContactInvitation(
                contactInvitation,
                client,
                deviceResult.device,
                fetchMyVerifiedDevices
              );
            } catch (err) {
              Alert.alert(
                "Failed to convert contact invitation to a contact. Please try again later.",
                `Error: ${err.message}`
              );
            }
          }
          // return if one accepted has been found (refetching should be triggered through the subscription on the privateInfoStore)
        }
      }

      const contactsResult = await client
        .query(
          contacts,
          {},
          {
            fetchOptions: {
              headers: {
                authorization: `signed-utc-msg ${createAuthenticationToken(
                  deviceResult.device
                )}`,
              },
            },
          }
        )
        .toPromise();

      if (
        contactInvitationsResult?.data?.contactInvitations &&
        contactsResult?.data?.contacts
      ) {
        setState({
          type: "result",
          contactInvitations:
            contactInvitationsResult?.data?.contactInvitations.map(
              (invitation) => {
                return { ...invitation, type: "contactInvitation" };
              }
            ),
          contacts: contactsResult?.data?.contacts,
        });
      } else {
        setState({
          type: "error",
        });
      }
    } catch (err) {
      setState({
        type: "error",
      });
    }
  };

  React.useEffect(() => {
    const privateInfoSubscriptionId = privateInfoStore.subscribeToPrivateInfo(
      async () => {
        await fetchContactInvitations();
      }
    );
    const unsubscribeNavigationFocus = navigation.addListener("focus", () => {
      fetchContactInvitations();
    });
    fetchContactInvitations();
    return () => {
      privateInfoStore.unsubscribeToPrivateInfo(privateInfoSubscriptionId);
      unsubscribeNavigationFocus();
    };
  }, [deviceResult.type, privateInfoResult.type, userResult.type, navigation]);

  return state;
};

export default useContactsAndContactInvitations;
