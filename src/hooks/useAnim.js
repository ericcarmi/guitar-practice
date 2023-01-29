import { useEffect, useState } from 'react';

const useAnimShow = () => {

	const [isAnim, setIsAnim] = useState(false);
	const [isShowing, setIsShowing] = useState(false);


	useEffect(() => {
		const timeout = setTimeout(() => {
			setIsShowing(prev => !prev);
		},100);
		return () => clearTimeout(timeout);
	},[setIsShowing])

};

export default useAnimShow;