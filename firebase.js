import {initializeApp} from "firebase/app";
import {
	createUserWithEmailAndPassword,
	getAuth,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signOut,
	updateProfile
} from "firebase/auth";
import {doc, getDoc, getFirestore, setDoc} from "firebase/firestore"
import toast from "react-hot-toast";
import {userHandle} from "utils";

const firebaseConfig = {
  apiKey: "AIzaSyCZ0NkDvbTfh-376slOEnO_JdLZkhC84vg",
  authDomain: "instagram-112.firebaseapp.com",
  projectId: "instagram-112",
  storageBucket: "instagram-112.appspot.com",
  messagingSenderId: "286621216178",
  appId: "1:286621216178:web:e847801f83d6c51e38c8ab"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth()
const db = getFirestore(app)

onAuthStateChanged(auth, async user => {
	if (user) {
		const dbUser = await getDoc(doc(db, "users", user.uid))
		let data = {
			uid: user.uid,
			fullName: user.displayName,
			email: user.email,
			emailVerified: user.emailVerified,
			...dbUser.data()
		}
		userHandle(data)
	} else {
		userHandle(false)
	}
})

export const login = async (email, password) => {
	try {
		return await signInWithEmailAndPassword(auth, email, password)
	} catch (err) {
		toast.error(err.code)
	}
}

export const getUserInfo = async uname => {
	const username = await getDoc(doc(db, "usernames", uname))
	if (username.exists()) {
		return (await getDoc(doc(db, "users", username.data().user_id))).data()
	} else {
		toast.error("Kullanıcı bulunamadı!")
		throw new Error("Kullanıcı bulunamadı!")
	}
}

export const register = async ({email, password, full_name, username}) => {
	try {
		const user = await getDoc(doc(db, "usernames", username))
		if (user.exists()) {
			toast.error(`${username} kullanıcı adı başkası tarafından kullanılıyor.`)
		} else {
			const response = await createUserWithEmailAndPassword(auth, email, password)
			if (response.user) {

				await setDoc(doc(db, "usernames", username), {
					user_id: response.user.uid
				})

				await setDoc(doc(db, "users", response.user.uid), {
					fullName: full_name,
					username: username,
					followers: [],
					following: [],
					notifications: [],
					website: '',
					bio: '',
					phoneNumber: '',
					gender: '',
					posts: 0
				})

				await updateProfile(auth.currentUser, {
					displayName: full_name
				})

				return response.user

			}
		}
	} catch (err) {
		toast.error(err.code)
	}
}

export const logout = async () => {
	try {
		await signOut(auth)
	} catch (err) {
		toast.error(err.code)
	}
}