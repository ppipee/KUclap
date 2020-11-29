import { h } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import styled, { withTheme } from "styled-components";

import { getHelmet } from "../components/utility/helmet";
import { NoMoreReview } from "../components/utility/Icons";
import { ReviewSkeletonA } from "../components/common/ReviewSkeleton";
import APIs from '../components/utility/apis'
import Details from "../components/common/Detail";
import Footer from "../components/common/Footer";
import PageTemplate from "../components/common/PageTemplate";
import ReviewCard from "../components/common/ReviewCard";

import {
	navigateToClassPage,
	navigateToHomePage,
	getClassName,
	getColorHash,
} from "../components/utility/helper";

import { SelectContext } from "../context/SelectContext";
import { ReviewFetcherProvider } from "../context/ReviewFetcherContext";

import {
	DetailTitle,
	AdaptorReviews,
	LastReview,
	ContainerNoMore,
	NoMoreCustom,
	SubjectTitle,
} from "../components/common/FetcherComponents";

const Button = styled.div`
	background-color: hsl(145, 63%, 42%);
	color: #fff;
	padding: 0.2rem 1.8rem;
	border-radius: 0.6rem;
	font-size: 2rem;
	cursor: pointer;

	&:active {
		background-color: hsl(145, 63%, 32%);
	}

	&:hover {
		background-color: hsl(145, 63%, 52%);
	}
`;

const ButtonLastReview = styled(Button)`
	border: 0.2rem solid #979797;
	background: ${(props) => props.theme.body};
	color: #979797;
	font-size: 1.7rem;
	margin-right: 1.5rem;
	&:hover {
		background: ${(props) => props.theme.lightColor2};
	}
`;

const ContainerBtns = styled.div`
	margin: 0;
	display: flex;
`;

const ReviewTitle = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 2.8rem;
`;

const ReviewPage = (props) => {
	const { 
		currentClass: subject,
		review, 
		loading, 
		isAvailable 
	} = props;

	const { state: selected } = useContext(SelectContext);

	return (
		<PageTemplate
			content={getHelmet("REVIEW", subject, review)}
			isFormPage={true}
			classID={review?.classId}
			{...props} 
		>
			
			<SubjectTitle color={isAvailable ? getColorHash(review.classId) : "#9ac1ee"}>
				<span>{isAvailable ? review.classId : "000000"}</span>
				{
					loading ? "กำลังโหลดข้อมูลวิชา..." 
						: isAvailable ? 
							getClassName(selected.label) 
							: "ไม่มีข้อมูลรีวิวในระบบ"
				}
				{/* {review ? getClassName(selected.label) : "ไม่มีข้อมูลรีวิวในระบบ"} */}
			</SubjectTitle>

			<Details score={review?.stats} />
			<LastReview>
				<ReviewTitle>
					<DetailTitle>รีวิวโดย {review?.author}</DetailTitle>
					<ContainerBtns>
						<ButtonLastReview onClick={navigateToHomePage}>
							หน้าแรก
						</ButtonLastReview>
						<Button onClick={() => navigateToClassPage(review.classId)}>แสดงทุกรีวิว</Button>
					</ContainerBtns>
				</ReviewTitle>

				<AdaptorReviews id="adaptor" />
				{
					loading ? ( <ReviewSkeletonA /> )
					 : isAvailable ? 
						  (<ReviewCard isBadge={false} currentRoute={"REVIEW"} {...review} />) 
						  : (<>
								<ContainerNoMore>
									<NoMoreCustom>
										<NoMoreReview />
									</NoMoreCustom>
								</ContainerNoMore>
							</>)
				}
				{/* {review ? (
					<ReviewCard isBadge={false} currentRoute={"REVIEW"} {...review} />
				) : (
					<>
						<ContainerNoMore>
							<NoMoreCustom>
								<NoMoreReview />
							</NoMoreCustom>
						</ContainerNoMore>
					</>
				)} */}
				<Footer />
			</LastReview>
		</PageTemplate>
	);
};

const Interface = (props) => {
	const { currentReview, currentClass, reviewID} = props;
	const { dispatch: dispatchSelected } = useContext(SelectContext);
	const [review, setReview] = useState([])
	const [loading, setLoading] = useState(true);
	const [isAvailable, setIsAvailable] = useState(false);

	useEffect(() => {
		if (currentReview && currentClass) {
			setLoading(false)
			setIsAvailable(true)
			dispatchSelected({
				type: "selected",
				value: { label: currentClass.label, classID: currentClass.classId },
			});
		} else {
			// // eslint-disable-next-line no-lonely-if
			// if(process.env.NODE_ENV === "development" && process.env.IS_DEV){
			// 	APIs.getReviewByReviewID( reviewID, (res) => {
			// 		APIs.getClassDetailByClassId(res.data.classId, (res) => {
			// 			dispatchSelected({
			// 				type: "selected",
			// 				value: { label: res.data.label, classID: res.data.classId },
			// 			});
			// 		});
			//		setReview({ ...res.data });
			// 	});
			// }

			setLoading(true);
			APIs.getReviewByReviewID(reviewID, (res) => {
				setLoading(false);
				setIsAvailable(true);
				
				APIs.getClassDetailByClassId(res.data.classId, (res) => {
					dispatchSelected({
						type: "selected",
						value: { label: res.data.label, classID: res.data.classId },
					});
				});

				setReview({ ...res.data });
			},
				() => {
					setLoading(false);
					setIsAvailable(false);
				}
			);
		}
	}, []);

	return (
		<ReviewFetcherProvider classID={(currentClass && currentClass.classId) || review.classId}>
			<ReviewPage 
				review={currentReview || review} 
				loading={loading}
				isAvailable={isAvailable}
				{...props} />
		</ReviewFetcherProvider>
	);
};

export default withTheme(Interface);
